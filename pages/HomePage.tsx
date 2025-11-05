import React from 'react';
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
    const { menuItems, currentUser, recommendations } = useAppContext();
    
    // Show a few featured items on the home page
    const featuredItems = menuItems.slice(0, 4);

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

            {currentUser && currentUser.role === UserRole.CUSTOMER && recommendations.length > 0 && (
                <section>
                    <h2 className="text-3xl font-bold text-center mb-8">Recommended For You ✨</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {recommendations.map(item => (
                            <MenuItemCard key={item.id} item={item} />
                        ))}
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
