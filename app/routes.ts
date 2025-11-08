import { type RouteConfig, index, prefix, route } from "@react-router/dev/routes";

export default [
    index("routes/index.tsx"),
    route('/about', 'routes/about.tsx'),
    route('/contact', 'routes/contact.tsx'),
    route('/bmi-calculator', 'routes/bmi-calculator.tsx'),
    route('/website-checker', 'routes/website-checker.tsx'),
    // Global login route
    route('/login', 'routes/login.tsx'),
    // Resource route for pricing API used by Website Checker (path normalized to /api/pricing)
    route('/api/pricing', 'routes/api.pricing.ts'),
    route('/wipe', 'routes/wipe.tsx'),
    route('/dashboard', 'routes/dashboard.tsx'),
    route('/my-account', 'routes/my-account.tsx'),
    route('/change-password', 'routes/change-password.tsx'),
    
    ...prefix('/hirelens', [
        index("routes/hirelens/index.tsx"),
        route('auth', 'routes/hirelens/auth.tsx'),
        route('upload', 'routes/hirelens/upload.tsx'),
        route('resume/:id', 'routes/hirelens/resume.tsx'),
    ]),
    
    ...prefix('/admin', [
        route('login', 'routes/admin/login.tsx'),
        route('dashboard', 'routes/admin/dashboard.tsx'),
        route('change-password', 'routes/admin/change-password.tsx'),
    ]),
] satisfies RouteConfig;
