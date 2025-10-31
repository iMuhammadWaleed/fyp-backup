

import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';

const AppLogo = () => (
    <div className="flex flex-col items-center space-y-2">
        <svg className="w-16 h-16 text-teal-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z" fill="currentColor"/>
            <path d="M12 5C10.14 5 8.5 6.27 8.5 7.75C8.5 9.23 10.14 10.5 12 10.5C13.86 10.5 15.5 9.23 15.5 7.75C15.5 6.27 13.86 5 12 5ZM12 9C11.04 9 10.5 8.44 10.5 7.75C10.5 7.06 11.04 6.5 12 6.5C12.96 6.5 13.5 7.06 13.5 7.75C13.5 8.44 12.96 9 12 9Z" fill="currentColor"/>
            <path d="M18 13.5C18 12.12 15.31 11 12 11C8.69 11 6 12.12 6 13.5V17H18V13.5ZM8 15.5V14.5C8.62 13.84 10.16 13 12 13C13.84 13 15.38 13.84 16 14.5V15.5H8Z" fill="currentColor"/>
        </svg>
        <h1 className="text-3xl font-bold text-gray-800">GourmetGo</h1>
    </div>
);

const AdminRegisterPage: React.FC = () => {
    return (
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 h-full bg-cover bg-center" style={{ backgroundImage: "url('https://picsum.photos/seed/auth-bg/1600/1200')"}}>
            <div className="max-w-md w-full bg-slate-50/90 backdrop-blur-sm rounded-xl shadow-2xl overflow-hidden">
                <div className="text-center p-8 bg-slate-100/90 border-b border-slate-200">
                    <AppLogo />
                    <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
                        Admin Registration
                    </h2>
                </div>
                <div className="p-8">
                    <div className="text-center">
                        <p className="text-gray-600">
                           Admin registration is disabled. New admin accounts must be created by an existing administrator from the User Management panel in the dashboard.
                        </p>
                    </div>
                    <div className="text-sm text-center mt-6">
                        <ReactRouterDOM.Link to="/admin/login" className="font-medium text-gray-500 hover:text-gray-700 text-xs">
                            &larr; Back to Admin Sign in
                        </ReactRouterDOM.Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminRegisterPage;