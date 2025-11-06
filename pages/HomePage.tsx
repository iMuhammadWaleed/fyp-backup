
import React, { useState } from 'react';
// FIX: Use namespace import for react-router-dom to resolve module export errors.
import * as ReactRouterDOM from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import MenuItemCard from '../components/MenuItemCard';
import { UserRole } from '../types';

const HowItWorksCard: React.FC<{ number: string, title: string, description: string, icon: React.ReactNode }> = ({ number, title, description, icon }) => (
    <div className="text-center p-6 bg-white rounded-lg shadow-md border border-gray-200">
        <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-2"><span className="text-teal-600">{number}</span> {title}</h3>
        <p className="text-gray-600">{description}</p>
    </div>
);

const TestimonialCard: React.FC<{ quote: string, author: string, role: string }> = ({ quote, author, role }) => (
    <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <p className="text-gray-700 italic text-lg mb-4">"{quote}"</p>
        <p className="font-bold text-teal-600">{author}</p>
        <p className="text-sm text-gray-500">{role}</p>
    </div>
);

const HomePage: React.FC = () => {
    const { menuItems, currentUser, mealPlan, generateMealPlan, clearMealPlan, isLoading, addToCart } = useAppContext();
    const [budget, setBudget] = useState('');
    const [planGenerated, setPlanGenerated] = useState(false);
    
    // Show a few featured items on the home page
    const featuredItems = menuItems.slice(0, 4);

    const handleGeneratePlan = (e: React.FormEvent) => {
        e.preventDefault();
        const budgetValue = parseFloat(budget);
        if (!budgetValue || budgetValue <= 0) {
            return;
        }
        clearMealPlan();
        generateMealPlan(budgetValue);
        setPlanGenerated(true);
    };

    const handleAddPlanToCart = () => {
        mealPlan.forEach(item => addToCart(item));
        alert('Meal plan added to your cart!');
    };

    const mealPlanTotal = mealPlan.reduce((total, item) => total + item.price, 0);

    return (
        <div className="space-y-16">
            <section 
                className="relative text-center bg-white py-20 px-4 rounded-lg shadow-lg overflow-hidden"
            >
                <div 
                    className="absolute inset-0 bg-cover bg-center" 
                    style={{ backgroundImage: "url('https://picsum.photos/seed/catering-event/1200/400')" }}
                ></div>
                <div className="absolute inset-0 bg-black opacity-50"></div>
                <div className="relative z-10">
                    <h1 className="text-5xl font-extrabold text-white mb-4">Exquisite Catering for Every Occasion</h1>
                    <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto">From corporate events to intimate gatherings, we deliver unforgettable culinary experiences.</p>
                    <ReactRouterDOM.Link to="/menu" className="bg-teal-600 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-teal-700 transition-transform hover:scale-105 inline-block">
                        View Full Menu
                    </ReactRouterDOM.Link>
                </div>
            </section>

            <section>
                <h2 className="text-3xl font-bold text-center mb-2">How It Works</h2>
                <p className="text-center text-gray-500 mb-10">Simple steps to get your delicious meal.</p>
                <div className="grid md:grid-cols-3 gap-8">
                    <HowItWorksCard
                        number="01."
                        title="Browse Our Menu"
                        description="Explore our diverse range of dishes and packages for any event."
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>}
                    />
                    <HowItWorksCard
                        number="02."
                        title="Place Your Order"
                        description="Add your favorites to the cart and securely check out in minutes."
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                    />
                    <HowItWorksCard
                        number="03."
                        title="Enjoy Your Meal"
                        description="We prepare and deliver your order fresh and on time. Bon appétit!"
                        icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.085a2 2 0 00-1.736.986L7 6" /></svg>}
                    />
                </div>
            </section>
            
            <section>
                <h2 className="text-3xl font-bold text-center mb-8">Featured Items</h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {featuredItems.map(item => (
                        <MenuItemCard key={item.id} item={item} />
                    ))}
                </div>
            </section>

             {currentUser && currentUser.role === UserRole.CUSTOMER && (
                 <section className="relative bg-gradient-to-br from-teal-50 to-cyan-100 p-8 md:p-12 rounded-2xl shadow-xl overflow-hidden">
                    <div className="absolute -top-10 -right-10 w-48 h-48 bg-teal-200/50 rounded-full blur-2xl"></div>
                    <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-cyan-200/50 rounded-full blur-2xl"></div>

                    <div className="relative z-10">
                        <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-3">AI Meal Planner 🤖</h2>
                        <p className="text-center text-gray-600 mb-10 max-w-2xl mx-auto">Tell us your budget, and our smart assistant will curate a personalized meal plan based on your unique tastes.</p>
                        
                        <div className="max-w-xl mx-auto bg-white/60 backdrop-blur-md p-6 rounded-xl shadow-lg border border-white/50">
                            <form onSubmit={handleGeneratePlan} className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="relative flex-grow w-full">
                                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 text-lg">PKR</span>
                                    <input
                                        type="number"
                                        value={budget}
                                        onChange={(e) => { setBudget(e.target.value); setPlanGenerated(false); }}
                                        placeholder="Enter your budget (e.g., 5000)"
                                        min="10"
                                        step="1"
                                        required
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-teal-500 text-lg"
                                        aria-label="Budget for meal plan"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full sm:w-auto bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold text-lg hover:bg-teal-700 disabled:bg-teal-400 disabled:cursor-wait transition-transform hover:scale-105 flex items-center justify-center gap-2"
                                >
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Generating...
                                        </>
                                    ) : (
                                        <>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.636-6.364l.707-.707M17.657 16.657l.707.707M6.343 7.343l-.707-.707m12.728 0l-.707.707M6.343 16.657l.707-.707" /></svg>
                                            Generate Plan
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>

                        {isLoading && planGenerated && (
                            <div className="text-center py-8">
                                <p className="text-lg text-gray-700 animate-pulse font-medium">Our AI is crafting your perfect meal... Please wait a moment.</p>
                            </div>
                        )}

                        {mealPlan.length > 0 && !isLoading && (
                            <div className="mt-12 page-enter-active">
                                <h3 className="text-3xl font-bold text-center mb-8">✨ Your Personalized Meal Plan ✨</h3>
                                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {mealPlan.map(item => (
                                        <MenuItemCard key={item.id} item={item} />
                                    ))}
                                </div>
                                <div className="mt-10 pt-8 border-t-2 border-dashed border-teal-200 flex flex-col items-center gap-4">
                                    <div className="text-3xl font-bold text-center">
                                        Plan Total: <span className="text-green-600">PKR {mealPlanTotal.toFixed(2)}</span>
                                    </div>
                                    <button
                                        onClick={handleAddPlanToCart}
                                        className="bg-green-500 text-white px-8 py-3 rounded-full font-semibold text-lg hover:bg-green-600 transition-transform hover:scale-105 flex items-center justify-center gap-2 shadow-lg"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                        Add Full Plan to Cart
                                    </button>
                                </div>
                            </div>
                        )}
                        {!isLoading && mealPlan.length === 0 && planGenerated && (
                            <div className="text-center bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-8 max-w-xl mx-auto">
                                <p className="font-semibold text-yellow-800">Our AI couldn't generate a suitable plan.</p>
                                <p className="text-sm text-yellow-700 mt-2">Try a different budget or add more items to your favorites to help us learn your taste!</p>
                            </div>
                        )}
                    </div>
                </section>
            )}

             <section className="bg-teal-50 py-12 rounded-lg">
                <h2 className="text-3xl font-bold text-center mb-10">What Our Customers Say</h2>
                <div className="grid md:grid-cols-3 gap-8 container mx-auto px-4">
                    <TestimonialCard 
                        quote="The food was absolutely amazing! Our guests couldn't stop talking about the Spaghetti Carbonara. Highly recommend GourmetGo for any event."
                        author="Jane Doe"
                        role="Event Organizer"
                    />
                    <TestimonialCard 
                        quote="Seamless ordering process and on-time delivery. The Family Feast Package was a huge hit with my family. Will definitely order again."
                        author="John Smith"
                        role="Happy Customer"
                    />
                     <TestimonialCard 
                        quote="Professional service from start to finish. The quality of the ingredients was top-notch, and every dish was delicious. Five stars!"
                        author="Emily White"
                        role="Corporate Client"
                    />
                </div>
            </section>
        </div>
    );
};

export default HomePage;
