import { useEffect, useRef, useState } from "react";
import Navbar from "~/components/Navbar";

export const meta = () => [
  { title: "BMI Calculator - AI-Powered Health Insights | Abbas Logic" },
  {
    name: "description",
    content: "Calculate your BMI and get personalized health improvement tips powered by AI. Track your health with accurate BMI calculations.",
  },
];

interface BMIResult {
  bmi: number;
  category: string;
  categoryColor: string;
  categoryBgColor: string;
  healthStatus: string;
}

interface HealthInsights {
  overview: string;
  tips: string[];
  mainAction: string;
  disclaimer: string;
}

interface ValidationErrors {
  age?: string;
  gender?: string;
  heightFeet?: string;
  heightInches?: string;
  weight?: string;
}

export default function BMICalculator() {
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    heightFeet: "",
    heightInches: "",
    weight: "",
  });

  const [wantsAIInsights, setWantsAIInsights] = useState(false);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [result, setResult] = useState<BMIResult | null>(null);
  const [insights, setInsights] = useState<HealthInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  // Check Puter authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (typeof window !== 'undefined' && window.puter) {
          const signedIn = await window.puter.auth.isSignedIn();
          setIsSignedIn(signedIn);
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      }
    };
    checkAuth();
  }, []);

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};
    
    // Age validation
    const age = parseInt(formData.age);
    if (!formData.age) {
      newErrors.age = "Age is required";
    } else if (age < 2 || age > 120) {
      newErrors.age = "Please enter a valid age between 2 and 120 years";
    }

    // Gender validation
    if (!formData.gender) {
      newErrors.gender = "Please select your gender";
    }

    // Height validation
    const feet = parseInt(formData.heightFeet);
    const inches = parseFloat(formData.heightInches);
    
    if (!formData.heightFeet) {
      newErrors.heightFeet = "Feet is required";
    } else if (feet < 1 || feet > 8) {
      newErrors.heightFeet = "Please enter a valid height (1-8 feet)";
    }

    if (formData.heightInches === "") {
      newErrors.heightInches = "Inches is required (enter 0 if none)";
    } else if (inches < 0 || inches >= 12) {
      newErrors.heightInches = "Please enter valid inches (0-11.9)";
    }

    // Weight validation
    const weight = parseFloat(formData.weight);
    if (!formData.weight) {
      newErrors.weight = "Weight is required";
    } else if (weight <= 0) {
      newErrors.weight = "Please enter a valid weight (must be greater than 0)";
    } else if (weight > 500) {
      newErrors.weight = "Please enter a realistic weight value";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateBMI = () => {
    // Convert feet and inches to meters
    const totalInches = parseFloat(formData.heightFeet) * 12 + parseFloat(formData.heightInches);
    const heightInMeters = totalInches * 0.0254; // Convert inches to meters
    const weightInKg = parseFloat(formData.weight);
    
    // BMI formula: weight (kg) / height (m)²
    const bmi = weightInKg / (heightInMeters * heightInMeters);
    return bmi;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) {
      return {
        category: "Underweight",
        categoryColor: "text-blue-600",
        categoryBgColor: "bg-blue-50 border-blue-200",
        healthStatus: "Below healthy weight range",
      };
    } else if (bmi >= 18.5 && bmi < 25) {
      return {
        category: "Normal Weight",
        categoryColor: "text-green-600",
        categoryBgColor: "bg-green-50 border-green-200",
        healthStatus: "Healthy weight range",
      };
    } else if (bmi >= 25 && bmi < 30) {
      return {
        category: "Overweight",
        categoryColor: "text-yellow-600",
        categoryBgColor: "bg-yellow-50 border-yellow-200",
        healthStatus: "Above healthy weight range",
      };
    } else {
      return {
        category: "Obese",
        categoryColor: "text-red-600",
        categoryBgColor: "bg-red-50 border-red-200",
        healthStatus: "Significantly above healthy weight range",
      };
    }
  };

  const generateHealthInsights = async (bmiData: BMIResult) => {
    setLoading(true);
    try {
      const prompt = `You are a friendly health coach. A ${formData.age}-year-old ${formData.gender} has a BMI of ${bmiData.bmi.toFixed(1)}, which is in the ${bmiData.category} category.

Provide helpful advice in a warm, encouraging tone that anyone can understand. Keep it simple and actionable.

Format your response as JSON:
{
  "overview": "A friendly 2-3 sentence overview explaining what this BMI means in simple terms",
  "tips": ["Tip 1", "Tip 2", "Tip 3", "Tip 4", "Tip 5"],
  "mainAction": "ONE most important action they should take right now",
  "disclaimer": "A brief, friendly reminder that this is general advice, not medical diagnosis"
}

Keep tips short (1 sentence each), practical, and easy to follow. Mix diet, exercise, and lifestyle advice.`;

      const response = await window.puter.ai.chat(prompt);
      const responseText = String(response);
      
      let parsedInsights: HealthInsights;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedInsights = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error("No JSON found");
        }
      } catch (e) {
        const categoryAdvice: Record<string, { tips: string[]; mainAction: string }> = {
          "Underweight": {
            tips: [
              "Add healthy calorie-dense foods like nuts, avocados, and whole grains to your meals",
              "Try eating 5-6 smaller meals throughout the day instead of 3 large ones",
              "Include protein-rich foods like eggs, fish, and lean meats in every meal",
              "Consider strength training to build healthy muscle mass",
              "Stay hydrated and get 7-9 hours of quality sleep each night"
            ],
            mainAction: "Start by adding one healthy snack between meals, like a handful of nuts or a smoothie with banana and peanut butter"
          },
          "Normal Weight": {
            tips: [
              "Keep up the great work! Maintain your balanced diet with plenty of fruits and veggies",
              "Stay active with at least 30 minutes of movement you enjoy each day",
              "Drink 8 glasses of water daily to keep your body running smoothly",
              "Get regular check-ups to catch any health issues early",
              "Focus on quality sleep - aim for 7-9 hours each night"
            ],
            mainAction: "Your main goal is to keep doing what you're doing! Try adding one new healthy habit this month"
          },
          "Overweight": {
            tips: [
              "Start with small changes - swap sugary drinks for water or unsweetened tea",
              "Fill half your plate with colorful vegetables at each meal",
              "Take a 15-minute walk after dinner, it aids digestion and burns calories",
              "Practice mindful eating - eat slowly and stop when you're satisfied",
              "Get 7-8 hours of sleep, as poor sleep can increase hunger hormones"
            ],
            mainAction: "Begin with ONE simple swap this week: replace one sugary drink per day with water"
          },
          "Obese": {
            tips: [
              "Start slow - even a 5-10% weight loss can significantly improve your health",
              "Focus on whole foods: lean proteins, vegetables, fruits, and whole grains",
              "Move more throughout the day - take stairs, park farther away, or dance",
              "Find a buddy or join a support group to stay motivated",
              "Track your progress with photos or how your clothes fit, not just the scale"
            ],
            mainAction: "Take the first step today: schedule an appointment with your doctor for a personalized plan"
          }
        };

        const advice = categoryAdvice[bmiData.category];
        parsedInsights = {
          overview: `Your BMI of ${bmiData.bmi.toFixed(1)} puts you in the ${bmiData.category} range. Small, consistent changes can make a big difference in your health!`,
          tips: advice.tips,
          mainAction: advice.mainAction,
          disclaimer: "Remember, BMI is just one measure of health. These are general wellness tips, not medical advice. Always consult with your healthcare provider."
        };
      }

      setInsights(parsedInsights);
    } catch (error) {
      console.error("Error:", error);
      setInsights({
        overview: `Your BMI is ${bmiData.bmi.toFixed(1)}, in the ${bmiData.category} category. Small, positive changes can help you feel healthier!`,
        tips: [
          "Eat more whole foods like fruits, vegetables, and whole grains",
          "Stay active - aim for 30 minutes of movement daily",
          "Drink plenty of water throughout the day",
          "Get 7-9 hours of quality sleep each night",
          "Practice mindful eating and listen to your body"
        ],
        mainAction: "Start with ONE small change this week that feels doable for you",
        disclaimer: "These are general wellness tips, not medical advice. Please consult with your healthcare provider."
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setCalculating(true);
    const bmi = calculateBMI();
    const categoryData = getBMICategory(bmi);
    const bmiResult: BMIResult = { bmi, ...categoryData };

    setResult(bmiResult);
    setCalculating(false);

    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);

    // Only generate AI insights if user opted in
    if (wantsAIInsights) {
      await generateHealthInsights(bmiResult);
    } else {
      setInsights(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    if (errors[name as keyof ValidationErrors]) {
      setErrors({ ...errors, [name]: undefined });
    }
  };

  const resetCalculator = () => {
    setFormData({ age: "", gender: "", heightFeet: "", heightInches: "", weight: "" });
    setResult(null);
    setInsights(null);
    setWantsAIInsights(false);
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <Navbar />

      <section className="relative pt-20 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Animated Lightning Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="lightning-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style={{ stopColor: '#10b981', stopOpacity: 0.15 }} />
                <stop offset="50%" style={{ stopColor: '#34d399', stopOpacity: 0.1 }} />
                <stop offset="100%" style={{ stopColor: '#6ee7b7', stopOpacity: 0.05 }} />
              </linearGradient>
            </defs>
            
            {/* Lightning bolts - scattered across viewport */}
            <path className="animate-pulse" d="M 100 -50 L 150 200 L 120 200 L 180 500" 
                  stroke="url(#lightning-gradient)" strokeWidth="2" fill="none" opacity="0.2"/>
            <path className="animate-pulse" style={{ animationDelay: '0.5s' }} 
                  d="M 300 -100 L 320 150 L 290 150 L 340 400" 
                  stroke="url(#lightning-gradient)" strokeWidth="2" fill="none" opacity="0.15"/>
            <path className="animate-pulse" style={{ animationDelay: '1s' }} 
                  d="M 500 50 L 520 250 L 490 250 L 540 500" 
                  stroke="url(#lightning-gradient)" strokeWidth="2" fill="none" opacity="0.12"/>
            <path className="animate-pulse" style={{ animationDelay: '1.5s' }} 
                  d="M 700 -20 L 730 180 L 700 180 L 760 450" 
                  stroke="url(#lightning-gradient)" strokeWidth="2" fill="none" opacity="0.18"/>
            <path className="animate-pulse" style={{ animationDelay: '2s' }} 
                  d="M 900 30 L 920 220 L 890 220 L 950 480" 
                  stroke="url(#lightning-gradient)" strokeWidth="2" fill="none" opacity="0.15"/>
            
            {/* Additional subtle lightning */}
            <path className="animate-pulse" style={{ animationDelay: '0.3s' }} 
                  d="M 200 100 L 210 280 L 190 280 L 230 520" 
                  stroke="url(#lightning-gradient)" strokeWidth="1.5" fill="none" opacity="0.1"/>
            <path className="animate-pulse" style={{ animationDelay: '1.2s' }} 
                  d="M 600 80 L 615 270 L 595 270 L 640 510" 
                  stroke="url(#lightning-gradient)" strokeWidth="1.5" fill="none" opacity="0.12"/>
            <path className="animate-pulse" style={{ animationDelay: '1.8s' }} 
                  d="M 800 -10 L 825 200 L 800 200 L 860 470" 
                  stroke="url(#lightning-gradient)" strokeWidth="1.5" fill="none" opacity="0.1"/>
          </svg>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            BMI Calculator with <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">AI Insights</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Calculate your Body Mass Index and get personalized health tips powered by AI
          </p>
        </div>
      </section>

      <section className="pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-white rounded-3xl shadow-2xl p-5 sm:p-8 lg:p-10 border border-gray-100">
              <div className="mb-6 sm:mb-8">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-2">Calculate Your BMI</h2>
                <p className="text-slate-600 text-sm">Enter your details below to get instant health insights</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-1">
                <div className="grid grid-cols-2 gap-3 sm:gap-5">
                  <div>
                    <label htmlFor="age" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2">
                      Age <span className="text-slate-400">(years)</span>
                    </label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2.5 sm:px-4 sm:py-3.5 text-sm sm:text-base rounded-xl border-2 ${errors.age ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-brand-primary focus:ring-brand-primary/20'} focus:ring-4 outline-none transition-all bg-gray-50 focus:bg-white`}
                      placeholder="25"
                    />
                    {errors.age && <p className="mt-2 text-xs text-red-600 font-medium">{errors.age}</p>}
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2">
                      Gender
                    </label>
                    <div className="relative">
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
                        className={`w-full px-3 py-2.5 pr-10 sm:px-4 sm:py-3.5 sm:pr-12 text-sm sm:text-base rounded-xl border-2 ${errors.gender ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-brand-primary focus:ring-brand-primary/20'} focus:ring-4 outline-none transition-all bg-gray-50 focus:bg-white cursor-pointer`}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 sm:pr-4 text-slate-400">
                        <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {errors.gender && <p className="mt-2 text-xs text-red-600 font-medium">{errors.gender}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2">
                    Height <span className="text-slate-400">(ft & in)</span>
                  </label>
                  <div className="flex items-center gap-2 sm:gap-3 px-3 py-2.5 sm:px-4 sm:py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 focus-within:border-brand-primary focus-within:ring-4 focus-within:ring-brand-primary/20 focus-within:bg-white transition-all">
                    <input
                      type="number"
                      name="heightFeet"
                      value={formData.heightFeet}
                      onChange={handleInputChange}
                      className="w-12 sm:w-16 px-2 py-1.5 sm:px-3 sm:py-2 text-sm sm:text-base text-center rounded-lg border-2 border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all bg-white"
                      placeholder="5"
                    />
                    <span className="text-slate-600 text-sm sm:text-base font-bold">ft</span>
                    <input
                      type="number"
                      step="0.1"
                      name="heightInches"
                      value={formData.heightInches}
                      onChange={handleInputChange}
                      className="w-12 sm:w-16 px-2 py-1.5 sm:px-3 sm:py-2 text-sm sm:text-base text-center rounded-lg border-2 border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all bg-white"
                      placeholder="8"
                    />
                    <span className="text-slate-600 text-sm sm:text-base font-bold">in</span>
                  </div>
                  {(errors.heightFeet || errors.heightInches) && (
                    <p className="mt-2 text-xs text-red-600 font-medium">
                      {errors.heightFeet || errors.heightInches}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="weight" className="block text-xs sm:text-sm font-semibold text-slate-700 mb-1.5 sm:mb-2">
                    Weight <span className="text-slate-400">(kg)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2.5 sm:px-4 sm:py-3.5 text-sm sm:text-base rounded-xl border-2 ${errors.weight ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-brand-primary focus:ring-brand-primary/20'} focus:ring-4 outline-none transition-all bg-gray-50 focus:bg-white`}
                    placeholder="70"
                  />
                  {errors.weight && <p className="mt-2 text-xs text-red-600 font-medium">{errors.weight}</p>}
                </div>

                {/* AI Insights Checkbox */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-4 sm:p-5 border-2 border-purple-100">
                  <label className="flex items-start gap-2 sm:gap-3 cursor-pointer group">
                    <div className="relative flex items-center justify-center mt-0.5">
                      <input
                        type="checkbox"
                        checked={wantsAIInsights}
                        onChange={(e) => setWantsAIInsights(e.target.checked)}
                        className="w-5 h-5 rounded border-2 border-purple-300 text-brand-primary focus:ring-4 focus:ring-brand-primary/20 cursor-pointer transition-all"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-900">Get AI-Powered Health Insights</span>
                          <span className="px-2 py-0.5 bg-gradient-to-r from-brand-primary to-brand-secondary text-white text-xs font-bold rounded-full">Free</span>
                      </div>
                      {wantsAIInsights && !isSignedIn && (
                        <div className="mt-3 flex items-start gap-2 p-3 bg-white/80 backdrop-blur rounded-xl border border-purple-200">
                          <svg className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-slate-900 mb-1">Puter Sign-In Required</p>
                            <p className="text-xs text-slate-600 leading-relaxed">
                              You'll be prompted to sign in with Puter to access AI-powered insights. It's free, secure, and takes just a moment.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                <div className="flex gap-3 sm:gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={calculating || loading}
                    className="flex-1 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-3 px-4 sm:py-4 sm:px-8 text-sm sm:text-base rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-95"
                  >
                    {calculating ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Calculating...
                      </span>
                    ) : "Calculate BMI"}
                  </button>
                  {result && (
                    <button
                      type="button"
                      onClick={resetCalculator}
                      className="px-4 py-3 sm:px-8 sm:py-4 bg-slate-100 text-slate-700 font-bold text-sm sm:text-base rounded-2xl hover:bg-slate-200 transition-all hover:shadow-md active:scale-95"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {result ? (
                <div ref={resultRef} className="animate-fade-in">
                  <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-8 border border-gray-100">
                    <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900 mb-4 sm:mb-6">Your BMI Result</h2>
                    
                    <div className="text-center mb-4 sm:mb-6">
                      <div className="inline-flex items-center justify-center w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-2xl mb-3 sm:mb-4 animate-scale-in">
                        <span className="text-4xl sm:text-5xl font-bold text-white">{result.bmi.toFixed(1)}</span>
                      </div>
                      <p className={`text-xl sm:text-2xl lg:text-3xl font-bold ${result.categoryColor} mb-2`}>{result.category}</p>
                      <p className="text-sm sm:text-base text-slate-600">{result.healthStatus}</p>
                    </div>

                    <div className={`p-3 sm:p-4 rounded-xl border ${result.categoryBgColor} mb-3 sm:mb-4`}>
                      <div className="flex justify-between text-xs text-slate-600 mb-2">
                        <span>Underweight</span>
                        <span>Normal</span>
                        <span>Overweight</span>
                        <span>Obese</span>
                      </div>
                      <div className="h-3 rounded-full overflow-hidden flex">
                        <div className="flex-1 bg-blue-400"></div>
                        <div className="flex-1 bg-green-400"></div>
                        <div className="flex-1 bg-yellow-400"></div>
                        <div className="flex-1 bg-red-400"></div>
                      </div>
                      <div className="flex justify-between text-xs text-slate-500 mt-1">
                        <span>&lt;18.5</span>
                        <span>18.5-24.9</span>
                        <span>25-29.9</span>
                        <span>≥30</span>
                      </div>
                    </div>
                  </div>

                  {loading ? (
                    <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-8 border border-gray-100">
                      <div className="flex items-center justify-center py-8 sm:py-12">
                        <div className="text-center">
                          <div className="inline-block w-10 h-10 sm:w-12 sm:h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-3 sm:mb-4"></div>
                          <p className="text-sm sm:text-base text-slate-600 font-semibold">Generating your personalized tips...</p>
                        </div>
                      </div>
                    </div>
                  ) : insights ? (
                    <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-8 border border-gray-100 animate-fade-in">
                      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">AI Health Insights</h2>
                      </div>

                      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-50 rounded-xl border border-green-100">
                        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">{insights.overview}</p>
                      </div>

                      <div className="mb-4 sm:mb-6 p-4 sm:p-5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white">
                        <h3 className="text-sm sm:text-base lg:text-lg font-bold mb-2">
                          Your Main Action Step
                        </h3>
                        <p className="text-sm sm:text-base lg:text-lg leading-relaxed">{insights.mainAction}</p>
                      </div>

                      <div className="mb-4 sm:mb-6">
                        <h3 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 mb-2 sm:mb-3">
                          Personalized Tips for You
                        </h3>
                        <ul className="space-y-2 sm:space-y-3">
                          {insights.tips.map((tip, index) => (
                            <li key={index} className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                              <svg className="w-4 h-4 sm:w-5 sm:h-5 text-green-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-sm sm:text-base text-slate-700 flex-1">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-3 sm:p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                        <p className="text-xs sm:text-sm text-yellow-800 flex items-start gap-2">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span><strong>Note:</strong> {insights.disclaimer}</span>
                        </p>
                      </div>
                    </div>
                  ) : result && !wantsAIInsights ? (
                    <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-8 border border-gray-100 animate-fade-in">
                      <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-slate-900">General Health Tips</h2>
                      </div>

                      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-xl border border-blue-100">
                        <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                          {result.category === "Underweight" && "Focus on nutrient-dense foods and consider consulting a healthcare provider about healthy weight gain strategies."}
                          {result.category === "Normal weight" && "Maintain your healthy weight through balanced nutrition and regular physical activity."}
                          {result.category === "Overweight" && "Small lifestyle changes can make a big difference. Focus on balanced meals and regular physical activity."}
                          {result.category === "Obese" && "Consider consulting with a healthcare provider to develop a personalized health improvement plan."}
                        </p>
                      </div>

                      <div className="mb-4 sm:mb-6">
                        <h3 className="text-sm sm:text-base lg:text-lg font-bold text-slate-900 mb-2 sm:mb-3">
                          General Wellness Tips
                        </h3>
                        <ul className="space-y-2 sm:space-y-3">
                          <li className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-slate-50 rounded-lg">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm sm:text-base text-slate-700 flex-1">Eat a balanced diet rich in fruits, vegetables, whole grains, and lean proteins</span>
                          </li>
                          <li className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-slate-50 rounded-lg">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm sm:text-base text-slate-700 flex-1">Aim for at least 150 minutes of moderate aerobic activity per week</span>
                          </li>
                          <li className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-slate-50 rounded-lg">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm sm:text-base text-slate-700 flex-1">Stay hydrated by drinking 8-10 glasses of water daily</span>
                          </li>
                          <li className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-slate-50 rounded-lg">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-sm sm:text-base text-slate-700 flex-1">Get 7-9 hours of quality sleep each night</span>
                          </li>
                          <li className="flex items-start gap-2 sm:gap-3 p-2.5 sm:p-3 bg-slate-50 rounded-lg">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            <span className="text-slate-700 flex-1">Manage stress through meditation, yoga, or other relaxation techniques</span>
                          </li>
                        </ul>
                      </div>

                      <div className="p-4 bg-purple-50 rounded-xl border border-purple-200">
                        <p className="text-sm text-purple-900 flex items-start gap-2 mb-3">
                          <svg className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                          <span><strong>Want personalized advice?</strong> Check the "Get AI-Powered Health Insights" option above for recommendations tailored specifically to your results!</span>
                        </p>
                      </div>

                      <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                        <p className="text-xs sm:text-sm text-yellow-800 flex items-start gap-2">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span><strong>Note:</strong> These are general wellness tips, not medical advice. Please consult with your healthcare provider for personalized guidance.</span>
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-8 border border-gray-100 flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
                  <div className="text-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      <svg className="w-8 h-8 sm:w-10 sm:h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2">Ready to Calculate?</h3>
                    <p className="text-sm sm:text-base text-slate-600">Fill in your details to get your BMI and personalized health insights</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* BMI Information Sections */}
      <section className="pb-12 sm:pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-white to-slate-50">
        <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8">
          
          {/* What is BMI */}
          <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-8 lg:p-10 border border-gray-100">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">What is BMI?</h2>
            </div>
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
              <p className="text-base sm:text-lg">
                Body Mass Index (BMI) is a simple screening tool used to categorize individuals into different weight categories based on their height and weight. It's widely used by healthcare professionals as an initial assessment of whether someone's weight falls within a healthy range.
              </p>
              <p>
                BMI was developed in the 19th century by Belgian mathematician Adolphe Quetelet. While it's not a perfect measure of health (it doesn't directly measure body fat or account for factors like muscle mass, bone density, or body composition), it provides a useful starting point for understanding weight-related health risks at a population level.
              </p>
              <div className="mt-6 p-5 bg-blue-50 rounded-xl border border-blue-100">
                <h3 className="font-bold text-slate-900 mb-2">
                  BMI Categories
                </h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-blue-400"></span>
                    <strong>Underweight:</strong> BMI less than 18.5
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-green-400"></span>
                    <strong>Normal weight:</strong> BMI 18.5 to 24.9
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-yellow-400"></span>
                    <strong>Overweight:</strong> BMI 25 to 29.9
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-400"></span>
                    <strong>Obese:</strong> BMI 30 or greater
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* BMI Formula */}
          <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-8 lg:p-10 border border-gray-100">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">BMI Formula</h2>
            </div>
            <div className="space-y-4 sm:space-y-6">
              <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                BMI is calculated using a simple mathematical formula that relates your weight to your height. The formula varies slightly depending on whether you use metric or imperial units.
              </p>
              
              <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
                <div className="p-4 sm:p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2 sm:mb-3">
                    Metric Formula
                  </h3>
                  <div className="bg-white p-3 sm:p-4 rounded-xl border border-purple-200 mb-2 sm:mb-3">
                    <p className="text-center text-sm sm:text-base lg:text-xl font-mono font-bold text-slate-900">
                      BMI = weight (kg) / [height (m)]²
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600">
                    <strong>Example:</strong> If you weigh 70 kg and are 1.75 m tall:<br/>
                    BMI = 70 / (1.75 × 1.75) = 70 / 3.06 = <strong>22.9</strong>
                  </p>
                </div>

                <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2 sm:mb-3">
                    Imperial Formula
                  </h3>
                  <div className="bg-white p-3 sm:p-4 rounded-xl border border-blue-200 mb-2 sm:mb-3">
                    <p className="text-center text-sm sm:text-base lg:text-xl font-mono font-bold text-slate-900">
                      BMI = [weight (lbs) / height (in)²] × 703
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600">
                    <strong>Example:</strong> If you weigh 154 lbs and are 69 inches tall:<br/>
                    BMI = (154 / (69 × 69)) × 703 = 22.7
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Limitations of BMI */}
          <div className="bg-white rounded-3xl shadow-xl p-5 sm:p-8 lg:p-10 border border-gray-100">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">Limitations of BMI</h2>
            </div>
            <div className="space-y-3 sm:space-y-4 text-sm sm:text-base text-slate-700 leading-relaxed">
              <p>
                While BMI is a useful screening tool, it's important to understand its limitations. BMI should be considered alongside other factors when assessing health.
              </p>
              <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 mt-4 sm:mt-6">
                <div className="p-4 sm:p-5 bg-orange-50 rounded-xl border border-orange-200">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2">
                    Muscle Mass
                  </h3>
                  <p className="text-xs sm:text-sm">
                    BMI doesn't distinguish between muscle and fat. Athletes with high muscle mass may be classified as overweight despite being very healthy.
                  </p>
                </div>
                <div className="p-4 sm:p-5 bg-orange-50 rounded-xl border border-orange-200">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2">
                    Body Composition
                  </h3>
                  <p className="text-xs sm:text-sm">
                    Two people with the same BMI can have very different body compositions, with varying amounts of fat and muscle.
                  </p>
                </div>
                <div className="p-4 sm:p-5 bg-orange-50 rounded-xl border border-orange-200">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2">
                    Age & Gender
                  </h3>
                  <p className="text-xs sm:text-sm">
                    BMI doesn't account for age, gender, or ethnic differences in body composition and health risks.
                  </p>
                </div>
                <div className="p-4 sm:p-5 bg-orange-50 rounded-xl border border-orange-200">
                  <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-2">
                    Fat Distribution
                  </h3>
                  <p className="text-xs sm:text-sm">
                    BMI doesn't indicate where fat is stored. Belly fat carries more health risks than fat stored elsewhere.
                  </p>
                </div>
              </div>
              <div className="mt-4 sm:mt-6 p-4 sm:p-5 bg-yellow-50 rounded-xl border border-yellow-200">
                <p className="text-xs sm:text-sm flex items-start gap-2">
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span><strong>Recommendation:</strong> Use BMI as one of several indicators of health. Consider consulting healthcare professionals for a comprehensive health assessment that includes body composition, waist circumference, blood pressure, cholesterol levels, and overall fitness.</span>
                </p>
              </div>
            </div>
          </div>

          {/* Why Track BMI */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl shadow-xl p-5 sm:p-8 lg:p-10 border border-green-200">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900">Why Track Your BMI?</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-start gap-2 sm:gap-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">Early Health Screening</h3>
                    <p className="text-xs sm:text-sm text-slate-600">Identify potential weight-related health risks early</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">Track Progress</h3>
                    <p className="text-xs sm:text-sm text-slate-600">Monitor changes in your weight status over time</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                  </svg>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">Set Goals</h3>
                    <p className="text-xs sm:text-sm text-slate-600">Establish realistic health and fitness objectives</p>
                  </div>
                </div>
              </div>
              <div className="space-y-2 sm:space-y-3">
                <div className="flex items-start gap-2 sm:gap-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">Healthcare Communication</h3>
                    <p className="text-xs sm:text-sm text-slate-600">Facilitate discussions with your healthcare provider</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">Lifestyle Awareness</h3>
                    <p className="text-xs sm:text-sm text-slate-600">Gain insight into how lifestyle choices affect your health</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 sm:gap-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 mb-1">Quick & Easy</h3>
                    <p className="text-xs sm:text-sm text-slate-600">Simple calculation you can do anytime, anywhere</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
    </div>
  );
}
