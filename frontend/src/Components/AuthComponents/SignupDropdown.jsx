import React, { useEffect, useRef, useState } from 'react'
import { useAuth } from '../../hooks/useAuth';

const SignupDropdown = (props) => {
    const [passwordError, setPasswordError] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    const validatePassword = (password) => {
        if (password.length < 8) return "Password must be at least 8 characters";
        if (!/[A-Z]/.test(password)) return "Password must contain at least one uppercase letter";
        if (!/[a-z]/.test(password)) return "Password must contain at least one lowercase letter";
        if (!/\d/.test(password)) return "Password must contain at least one number";
        return "";
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const result = await register(formData);

        if (!result.success) {
            setError(result.error);
        }

        setLoading(false);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === 'password') {
            setPasswordError(validatePassword(value));
        }
    };

    return (
        <div
            className='flex flex-col justify-center px-6 py-6 fixed rounded-lg right-16 top-16 z-50
            shadow-2xl border border-gray-800 w-80
            transition-all duration-300 ease-out transform bg-green-200
            max-sm:px-4 max-sm:py-4 max-sm:right-3 max-sm:w-74
            '>
            <h2 className="mt-2 text-center text-xl font-bold tracking-tight z-50">
                Create an Account
            </h2>

            <div className="mt-6 w-full">
                <form onSubmit={handleSubmit} className="space-y-5" >
                    <div>
                        <label className="block text-sm font-medium  mb-2">
                            Username
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            autoComplete="off"
                            className="block w-full rounded-lg bg-custom-black border border-gray-600 px-3 py-2.5
                                     placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2
                                     transition-all duration-200 hover:border-gray-500"
                            placeholder="Enter your username"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                            Email address
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            autoComplete="off"
                            value={formData.email}
                            onChange={handleChange}
                            className="block w-full rounded-lg bg-custom-black border border-gray-600 px-3 py-2.5 
                                     placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2
                                     transition-all duration-200 hover:border-gray-500"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label htmlFor="password" className="block text-sm font-medium ">
                                Password
                            </label>
                        </div>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className={`block w-full rounded-lg bg-custom-black border border-gray-600 px-3 py-2.5
                                     placeholder:text-gray-400 focus:border-green-500 focus:outline-none focus:ring-2
                                     transition-all duration-200 hover:border-gray-500
                                     ${passwordError ? 'border-red-300' : 'border-gray-300'
                                }`}
                            placeholder="Enter your password"
                        />
                        {passwordError && (
                            <p className="text-xs text-red-500 mt-1">{passwordError}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">
                            At least 8 characters with uppercase, lowercase, and number
                        </p>
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex w-full justify-center rounded-lg bg-green-700 px-3 py-2.5 text-sm font-semibold
                                     hover:bg-green-800 focus:outline-none text-white
                                     transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
                                     cursor-pointer"
                        >
                            {loading ? 'Creating account...' : 'Sign Up'}
                        </button>
                    </div>
                </form>

                <p className="mt-5 text-center text-sm text-gray-400">
                    Already a member?
                    <button
                        className="font-semibold text-green-700 hover:text-red-300 transition-colors duration-200 hover:underline cursor-pointer bg-transparent border-none p-0"
                        onClick={() => props.openLogin()}

                    >
                        Sign in instead
                    </button>
                </p>
            </div>
        </div>
    )
}

export default SignupDropdown