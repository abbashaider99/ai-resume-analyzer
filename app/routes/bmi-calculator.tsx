import { useRef, useState } from "react";
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

  const [errors, setErrors] = useState<ValidationErrors>({});
  const [result, setResult] = useState<BMIResult | null>(null);
  const [insights, setInsights] = useState<HealthInsights | null>(null);
  const [loading, setLoading] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

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

    await generateHealthInsights(bmiResult);
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
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <Navbar />

      <section className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl mb-4 shadow-lg">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">
            BMI Calculator with <span className="bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent">AI Insights</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Calculate your Body Mass Index and get personalized health tips powered by AI
          </p>
        </div>
      </section>

      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-gray-100">
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-900 mb-2">Calculate Your BMI</h2>
                <p className="text-slate-600 text-sm">Enter your details below to get instant health insights</p>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-1">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="age" className="block text-sm font-semibold text-slate-700 mb-2">
                      Age <span className="text-slate-400">(years)</span>
                    </label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      value={formData.age}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3.5 text-base rounded-xl border-2 ${errors.age ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-brand-primary focus:ring-brand-primary/20'} focus:ring-4 outline-none transition-all bg-gray-50 focus:bg-white`}
                      placeholder="25"
                    />
                    {errors.age && <p className="mt-2 text-xs text-red-600 font-medium">{errors.age}</p>}
                  </div>

                  <div>
                    <label htmlFor="gender" className="block text-sm font-semibold text-slate-700 mb-2">
                      Gender
                    </label>
                    <div className="relative">
                      <select
                        id="gender"
                        name="gender"
                        value={formData.gender}
                        onChange={handleInputChange}
                        style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
                        className={`w-full px-4 py-3.5 pr-12 text-base rounded-xl border-2 ${errors.gender ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-brand-primary focus:ring-brand-primary/20'} focus:ring-4 outline-none transition-all bg-gray-50 focus:bg-white cursor-pointer`}
                      >
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-4 text-slate-400">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {errors.gender && <p className="mt-2 text-xs text-red-600 font-medium">{errors.gender}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">
                    Height <span className="text-slate-400">(ft & in)</span>
                  </label>
                  <div className="flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-gray-50 focus-within:border-brand-primary focus-within:ring-4 focus-within:ring-brand-primary/20 focus-within:bg-white transition-all">
                    <input
                      type="number"
                      name="heightFeet"
                      value={formData.heightFeet}
                      onChange={handleInputChange}
                      className="w-16 px-3 py-2 text-base text-center rounded-lg border-2 border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all bg-white"
                      placeholder="5"
                    />
                    <span className="text-slate-600 text-base font-bold">ft</span>
                    <input
                      type="number"
                      step="0.1"
                      name="heightInches"
                      value={formData.heightInches}
                      onChange={handleInputChange}
                      className="w-16 px-3 py-2 text-base text-center rounded-lg border-2 border-gray-300 focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/20 outline-none transition-all bg-white"
                      placeholder="8"
                    />
                    <span className="text-slate-600 text-base font-bold">in</span>
                  </div>
                  {(errors.heightFeet || errors.heightInches) && (
                    <p className="mt-2 text-xs text-red-600 font-medium">
                      {errors.heightFeet || errors.heightInches}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="weight" className="block text-sm font-semibold text-slate-700 mb-2">
                    Weight <span className="text-slate-400">(kg)</span>
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    id="weight"
                    name="weight"
                    value={formData.weight}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3.5 text-base rounded-xl border-2 ${errors.weight ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200 focus:border-brand-primary focus:ring-brand-primary/20'} focus:ring-4 outline-none transition-all bg-gray-50 focus:bg-white`}
                    placeholder="70"
                  />
                  {errors.weight && <p className="mt-2 text-xs text-red-600 font-medium">{errors.weight}</p>}
                </div>

                <div className="flex gap-4 pt-2">
                  <button
                    type="submit"
                    disabled={calculating || loading}
                    className="flex-1 bg-gradient-to-r from-brand-primary to-brand-secondary text-white font-bold py-4 px-8 text-base rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none active:scale-95"
                  >
                    {calculating ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
                      className="px-8 py-4 bg-slate-100 text-slate-700 font-bold text-base rounded-2xl hover:bg-slate-200 transition-all hover:shadow-md active:scale-95"
                    >
                      Reset
                    </button>
                  )}
                </div>
              </form>
            </div>

            <div className="space-y-6">
              {result ? (
                <div ref={resultRef} className="animate-fade-in">
                  <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                    <h2 className="text-2xl font-bold text-slate-900 mb-6">Your BMI Result</h2>
                    
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-2xl mb-4 animate-scale-in">
                        <span className="text-5xl font-bold text-white">{result.bmi.toFixed(1)}</span>
                      </div>
                      <p className={`text-3xl font-bold ${result.categoryColor} mb-2`}>{result.category}</p>
                      <p className="text-slate-600">{result.healthStatus}</p>
                    </div>

                    <div className={`p-4 rounded-xl border ${result.categoryBgColor} mb-4`}>
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
                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100">
                      <div className="flex items-center justify-center py-12">
                        <div className="text-center">
                          <div className="inline-block w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                          <p className="text-slate-600 font-semibold">Generating your personalized tips...</p>
                        </div>
                      </div>
                    </div>
                  ) : insights ? (
                    <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 animate-fade-in">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">AI Health Insights</h2>
                      </div>

                      <div className="mb-6 p-4 bg-green-50 rounded-xl border border-green-100">
                        <p className="text-slate-700 leading-relaxed">{insights.overview}</p>
                      </div>

                      <div className="mb-6 p-5 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl text-white">
                        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
                          <span className="text-2xl">⭐</span>
                          Your Main Action Step
                        </h3>
                        <p className="text-lg leading-relaxed">{insights.mainAction}</p>
                      </div>

                      <div className="mb-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center gap-2">
                          <span className="text-2xl">💡</span>
                          Personalized Tips for You
                        </h3>
                        <ul className="space-y-3">
                          {insights.tips.map((tip, index) => (
                            <li key={index} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                              <span className="text-green-500 mt-0.5 text-xl">✓</span>
                              <span className="text-slate-700 flex-1">{tip}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                        <p className="text-sm text-yellow-800 flex items-start gap-2">
                          <span className="text-lg mt-0.5">ℹ️</span>
                          <span><strong>Note:</strong> {insights.disclaimer}</span>
                        </p>
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : (
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-gray-100 flex items-center justify-center min-h-[400px]">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to Calculate?</h3>
                    <p className="text-slate-600">Fill in your details to get your BMI and personalized health insights</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
