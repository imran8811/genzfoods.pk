import { Component, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  email = '';
  password = '';
  errorMessage = signal('');
  loading = signal(false);

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit() {
    this.errorMessage.set('');

    if (!this.email || !this.password) {
      this.errorMessage.set('Please fill in all fields.');
      return;
    }

    this.loading.set(true);
    this.authService.login(this.email, this.password).subscribe(result => {
      if (result.success) {
        this.router.navigate(['/']);
      } else {
        this.errorMessage.set(result.message);
      }
      this.loading.set(false);
    });
  }
}
