const Footer = () => {
  return (
    <footer className="w-full bg-white py-4 border-t mt-auto">
      <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-2">
          <img src="/assets/logo.png" alt="HireLens Logo" className="h-8 w-auto" />
          <span className="text-xl font-semibold text-gradient">HireLens</span>
        </div>
        <div className="text-gray-600 text-sm max-md:text-center">
          <p>Developed by <a href="https://techglobiz.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">TechGlobiz</a> & <a href="https://github.com/abbashaider99" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Abbas Haider</a></p>
          <p className="text-gray-500">© {new Date().getFullYear()} HireLens. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;