import { Injectable, signal, computed, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'user' | 'admin';
}

interface StoredUser extends User {
    password: string;
}

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private platformId = inject(PLATFORM_ID);
    private router = inject(Router);
    private isBrowser = isPlatformBrowser(this.platformId);

    private currentUser = signal<User | null>(null);

    isAuthenticated = computed(() => !!this.currentUser());
    user = computed(() => this.currentUser());
    isAdmin = computed(() => this.currentUser()?.role === 'admin');

    constructor() {
        this.loadUserFromStorage();
    }

    private loadUserFromStorage(): void {
        if (!this.isBrowser) return;
        const stored = localStorage.getItem('genz_current_user');
        if (stored) {
            try {
                this.currentUser.set(JSON.parse(stored));
            } catch {
                localStorage.removeItem('genz_current_user');
            }
        }
    }

    private getUsers(): StoredUser[] {
        if (!this.isBrowser) return [];
        const data = localStorage.getItem('genz_users');
        return data ? JSON.parse(data) : [];
    }

    private saveUsers(users: StoredUser[]): void {
        if (!this.isBrowser) return;
        localStorage.setItem('genz_users', JSON.stringify(users));
    }

    private setCurrentUser(user: User): void {
        this.currentUser.set(user);
        if (this.isBrowser) {
            localStorage.setItem('genz_current_user', JSON.stringify(user));
        }
    }

    signup(name: string, email: string, password: string): { success: boolean; message: string } {
        const users = this.getUsers();
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            return { success: false, message: 'An account with this email already exists.' };
        }

        const newUser: StoredUser = {
            id: crypto.randomUUID(),
            name,
            email,
            password,
            role: 'user',
        };

        users.push(newUser);
        this.saveUsers(users);

        const { password: _, ...userWithoutPassword } = newUser;
        this.setCurrentUser(userWithoutPassword);

        return { success: true, message: 'Account created successfully!' };
    }

    login(email: string, password: string): { success: boolean; message: string } {
        const users = this.getUsers();
        const user = users.find(
            u => u.email.toLowerCase() === email.toLowerCase() && u.password === password
        );

        if (!user) {
            return { success: false, message: 'Invalid email or password.' };
        }

        const { password: _, ...userWithoutPassword } = user;
        this.setCurrentUser(userWithoutPassword);

        return { success: true, message: 'Login successful!' };
    }

    logout(): void {
        this.currentUser.set(null);
        if (this.isBrowser) {
            localStorage.removeItem('genz_current_user');
        }
        this.router.navigate(['/']);
    }

    requestPasswordReset(email: string): { success: boolean; message: string } {
        const users = this.getUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!user) {
            return { success: false, message: 'No account found with this email.' };
        }
        // In a real app, this would send an email. We generate a mock token.
        if (this.isBrowser) {
            localStorage.setItem('genz_reset_email', email);
        }
        return { success: true, message: 'Password reset link sent! Check your email.' };
    }

    resetPassword(newPassword: string): { success: boolean; message: string } {
        if (!this.isBrowser) return { success: false, message: 'Not available.' };

        const email = localStorage.getItem('genz_reset_email');
        if (!email) {
            return { success: false, message: 'Invalid or expired reset link.' };
        }

        const users = this.getUsers();
        const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
        if (userIndex === -1) {
            return { success: false, message: 'User not found.' };
        }

        users[userIndex].password = newPassword;
        this.saveUsers(users);
        localStorage.removeItem('genz_reset_email');

        return { success: true, message: 'Password reset successful! You can now login.' };
    }
}
