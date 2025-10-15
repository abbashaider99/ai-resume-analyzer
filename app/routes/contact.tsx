import Navbar from "~/components/Navbar";

export function meta() {
  return [{ title: "HireLens | Contact Us" }];
}

const ContactPage = () => {
  const handleSubmit = () => {
    // Placeholder for form submission logic (e.g., API call or client-side handling)
    console.log("Form submitted");
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-100">
      <Navbar />
      
      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
              Contact Us
            </h1>
            <h2 className="text-xl sm:text-2xl text-gray-600 max-w-3xl mx-auto">
              Connect with our team for inquiries, support, or feedback.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Contact Information Box */}
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
                Contact Information
              </h3>
              <div className="flex flex-col gap-4">
                <p className="text-base sm:text-lg text-gray-700">
                  <strong>Abbas Haider</strong>
                  <br />
                  Software Developer, HireLens
                </p>
                <p className="text-base sm:text-lg text-gray-700">
                  <strong>Location:</strong> Delhi, India
                </p>
                <p className="text-base sm:text-lg text-gray-700">
                  <strong>Phone:</strong>{" "}
                  <a href="tel:+919456916070" className="text-blue-600 hover:underline">
                    +91 9456916070
                  </a>
                </p>
                <p className="text-base sm:text-lg text-gray-700">
                  <strong>Email:</strong>{" "}
                  <a href="mailto:contact@techglobiz.com" className="text-blue-600 hover:underline">
                    contact@techglobiz.com
                  </a>
                </p>
                <div className="flex flex-col gap-2">
                  <a
                    href="https://github.com/abbashaider99"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-blue-600 text-base sm:text-lg transition-colors duration-200"
                  >
                    <strong>GitHub:</strong> abbashaider99
                  </a>
                  <a
                    href="https://techglobiz.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-700 hover:text-blue-600 text-base sm:text-lg transition-colors duration-200"
                  >
                    <strong>Website:</strong> techglobiz.com
                  </a>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white rounded-xl shadow-sm p-6 sm:p-8">
              <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6">
                Send Us a Message
              </h3>
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    placeholder="Your name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-lg"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    placeholder="Your email"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-base sm:text-lg"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label htmlFor="message" className="text-sm font-medium text-gray-700">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    placeholder="Your message"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-base sm:text-lg"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  className="primary-button w-fit"
                >
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default ContactPage;