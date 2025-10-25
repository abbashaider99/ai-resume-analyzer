import { type RouteConfig, index, prefix, route } from "@react-router/dev/routes";

export default [
    index("routes/index.tsx"),
    route('/about', 'routes/about.tsx'),
    route('/contact', 'routes/contact.tsx'),
    route('/bmi-calculator', 'routes/bmi-calculator.tsx'),
    route('/website-checker', 'routes/website-checker.tsx'),
    route('/wipe', 'routes/wipe.tsx'),
    
    ...prefix('/hirelens', [
        index("routes/hirelens/index.tsx"),
        route('auth', 'routes/hirelens/auth.tsx'),
        route('upload', 'routes/hirelens/upload.tsx'),
        route('resume/:id', 'routes/hirelens/resume.tsx'),
    ]),
] satisfies RouteConfig;
