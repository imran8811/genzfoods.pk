import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup',
  imports: [FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.scss',
})
export class Signup {
  name = '';
  email = '';
  password = '';
  confirmPassword = '';
  errorMessage = signal('');
  loading = signal(false);

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit() {
    this.errorMessage.set('');

    if (!this.name || !this.email || !this.password || !this.confirmPassword) {
      this.errorMessage.set('Please fill in all fields.');
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage.set('Password must be at least 6 characters.');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage.set('Passwords do not match.');
      return;
    }

    this.loading.set(true);
    setTimeout(() => {
      const result = this.authService.signup(this.name, this.email, this.password);
      if (result.success) {
        this.router.navigate(['/']);
      } else {
        this.errorMessage.set(result.message);
      }
      this.loading.set(false);
    }, 600);
  }
}
