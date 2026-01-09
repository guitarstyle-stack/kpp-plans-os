'use client';

import { Toaster } from 'react-hot-toast';

export default function ToastProvider() {
    return (
        <Toaster
            position="top-right"
            toastOptions={{
                duration: 4000,
                style: {
                    background: '#333',
                    color: '#fff',
                },
                success: {
                    style: {
                        background: '#10B981', // green-500
                        color: 'white',
                    },
                },
                error: {
                    style: {
                        background: '#EF4444', // red-500
                        color: 'white',
                    },
                },
            }}
        />
    );
}
