import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Stethoscope, Building2, User } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';

export function Home() {
  const navigate = useNavigate();
  const [role, setRole] = useState<'doctor' | 'employee'>('doctor');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      if (role === 'doctor') {
        navigate('/doctor');
      } else {
        navigate('/admin');
      }
    }, 600);
  };

  const getEmailPlaceholder = () => {
    if (role === 'doctor') return 'dr.smith@healthcore.com';
    return 'admin@healthcore.com';
  };

  const getRoleDisplayName = () => {
    if (role === 'doctor') return 'Doctor';
    return 'Employee';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-800">
      <Card className="w-full max-w-md shadow-lg border-slate-200/60">
        <CardHeader className="text-center pb-2 border-none">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white mx-auto mb-4 shadow-sm">
            <Stethoscope size={24} />
          </div>
          <CardTitle className="text-2xl">HealthCore System</CardTitle>
          <CardDescription>Please sign in to your account</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('doctor')}
                className={`py-3 px-2 rounded-xl border text-sm font-medium flex flex-col items-center gap-2 transition-all duration-200 ${
                  role === 'doctor'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <Stethoscope size={20} className={role === 'doctor' ? 'text-blue-600' : 'text-slate-400'} />
                Doctor
              </button>
              <button
                type="button"
                onClick={() => setRole('employee')}
                className={`py-3 px-2 rounded-xl border text-sm font-medium flex flex-col items-center gap-2 transition-all duration-200 ${
                  role === 'employee'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-600'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <Building2 size={20} className={role === 'employee' ? 'text-blue-600' : 'text-slate-400'} />
                Employee
              </button>
            </div>

            <div className="space-y-4">
              <Input 
                label="Email Address"
                type="email" 
                required
                placeholder="Enter your email" 
                defaultValue={getEmailPlaceholder()}
                key={role} // Force re-render to update defaultValue when role changes
              />
              <Input 
                label="Password"
                type="password" 
                required
                placeholder="••••••••" 
                defaultValue="password123"
              />
            </div>

            <Button 
              type="submit"
              className="w-full"
              size="lg"
              isLoading={isLoading}
            >
              Sign In as {getRoleDisplayName()}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
