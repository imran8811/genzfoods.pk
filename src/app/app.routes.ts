import { Routes } from '@angular/router';
import { Home } from './components/home/home';
import { Login } from './components/login/login';
import { Menu } from './components/menu/menu';
import { Signup } from './components/signup/signup';
import { ForgotPassword } from './components/forgot-password/forgot-password';
import { ResetPassword } from './components/reset-password/reset-password';
import { Cart } from './components/cart/cart';
import { Checkout } from './components/checkout/checkout';
import { OrderConfirmation } from './components/order-confirmation/order-confirmation';
import { guestGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { AdminLayout } from './components/admin/admin-layout/admin-layout';
import { AdminDashboard } from './components/admin/dashboard/admin-dashboard';
import { AdminCategories } from './components/admin/categories/admin-categories';
import { AdminItems } from './components/admin/items/admin-items';
import { AdminDeals } from './components/admin/deals/admin-deals';
import { AdminOrders } from './components/admin/orders/admin-orders';

export const routes: Routes = [
    {
        path: "",
        component: Home
    },
    {
        path: "menu",
        component: Menu
    },
    {
        path: "cart",
        component: Cart
    },
    {
        path: "checkout",
        component: Checkout
    },
    {
        path: "order-confirmation",
        component: OrderConfirmation
    },
    {
        path: "login",
        component: Login,
        canActivate: [guestGuard]
    },
    {
        path: "signup",
        component: Signup,
        canActivate: [guestGuard]
    },
    {
        path: "forgot-password",
        component: ForgotPassword,
        canActivate: [guestGuard]
    },
    {
        path: "reset-password",
        component: ResetPassword,
        canActivate: [guestGuard]
    },
    {
        path: "admin",
        component: AdminLayout,
        canActivate: [adminGuard],
        children: [
            { path: "", component: AdminDashboard },
            { path: "categories", component: AdminCategories },
            { path: "items", component: AdminItems },
            { path: "deals", component: AdminDeals },
            { path: "orders", component: AdminOrders }
        ]
    }
];
