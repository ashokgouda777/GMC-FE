import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
    // Only intercept requests to our specific API URL
    if (!req.url.startsWith(environment.apiUrl)) {
        return next(req);
    }

    // Exclude login requests specifically by checking if the URL ends with exact login paths
    const isLoginRequest = req.url.endsWith('/Users/login') || req.url.endsWith('/Users/userlogin');
    
    // Get token directly from localStorage to avoid circular dependency with AuthService
    const currentUserStr = localStorage.getItem('currentUser');
    let token = null;

    if (currentUserStr) {
        try {
            const user = JSON.parse(currentUserStr);
            token = user?.token;
        } catch (e) {
            console.error('AuthInterceptor: Error parsing user token', e);
        }
    }

    // Attach token if present and not a login request
    // Alternatively, if the user wants it "by default" for ALL, 
    // we could remove !isLoginRequest, but usually it's better to exclude it.
    if (token && !isLoginRequest) {
        const cloned = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        return next(cloned);
    }

    return next(req);
};
