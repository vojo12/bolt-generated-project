import { useState } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { useForm } from 'react-hook-form';
    import { zodResolver } from '@hookform/resolvers/zod';
    import * as z from 'zod';

    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(6)
    });

    export default function AuthPage({ setUser }) {
      const { register, handleSubmit } = useForm({
        resolver: zodResolver(schema)
      });
      const [isLogin, setIsLogin] = useState(true);
      const navigate = useNavigate();

      const onSubmit = async (data) => {
        const endpoint = isLogin ? '/api/login' : '/api/register';
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          const { token } = await response.json();
          localStorage.setItem('token', token);
          setUser({ email: data.email });
          navigate('/dashboard');
        }
      };

      return (
        <div className="auth-container">
          <h1>{isLogin ? 'Login' : 'Register'}</h1>
          <form onSubmit={handleSubmit(onSubmit)}>
            <input {...register('email')} placeholder="Email" />
            <input {...register('password')} type="password" placeholder="Password" />
            <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
          </form>
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Need to register?' : 'Already have an account?'}
          </button>
        </div>
      );
    }
