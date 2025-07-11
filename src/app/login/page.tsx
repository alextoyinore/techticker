'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { signInWithGoogle, signUpWithEmail, signInWithEmail, user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  if (authLoading || user) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <LoaderCircle className="h-8 w-8 animate-spin" />
        </div>
    );
  }

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
      // onAuthStateChanged in context will handle redirect
    } catch (error: any) {
      setAuthError(error.message);
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);
    try {
      await signInWithEmail(loginEmail, loginPassword);
      // onAuthStateChanged in context will handle redirect
    } catch (error: any) {
      setAuthError(error.message);
      toast({ variant: 'destructive', title: 'Login Failed', description: error.message });
    } finally {
        setLoading(false);
    }
  };
  
  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (signupPassword !== signupConfirmPassword) {
      setAuthError("Passwords don't match.");
      toast({ variant: 'destructive', title: 'Signup Failed', description: "Passwords don't match." });
      return;
    }
    setLoading(true);
    setAuthError(null);
    try {
      await signUpWithEmail(signupEmail, signupPassword);
      toast({ title: 'Success!', description: 'Your account has been created. Please log in.' });
      // onAuthStateChanged in context will handle redirect
    } catch (error: any) {
      setAuthError(error.message);
      toast({ variant: 'destructive', title: 'Signup Failed', description: error.message });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold font-headline">TechTicker</h1>
        </div>
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
                <CardDescription>
                  Enter your credentials to access your account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input id="login-email" type="email" placeholder="m@example.com" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="login-password">Password</Label>
                    <div className="relative">
                        <Input 
                            id="login-password" 
                            type={showLoginPassword ? 'text' : 'password'} 
                            required 
                            value={loginPassword} 
                            onChange={(e) => setLoginPassword(e.target.value)}
                            className="pr-10"
                        />
                        <button 
                            type="button" 
                            className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-10 text-muted-foreground" 
                            onClick={() => setShowLoginPassword(prev => !prev)}
                            aria-label={showLoginPassword ? "Hide password" : "Show password"}
                        >
                            {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                  </div>
                  {authError && <p className="text-sm text-destructive">{authError}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <LoaderCircle className="animate-spin" /> : 'Login'}
                  </Button>
                </form>
                <div className="mt-4 text-center text-sm relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                </div>
                <Button variant="outline" className="w-full mt-4" onClick={handleGoogleSignIn} disabled={loading}>
                  Login with Google
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl font-headline">Create an Account</CardTitle>
                <CardDescription>
                  Enter your information to create an account.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input id="signup-email" type="email" placeholder="m@example.com" required value={signupEmail} onChange={(e) => setSignupEmail(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="signup-password">Password</Label>
                     <div className="relative">
                        <Input 
                            id="signup-password" 
                            type={showSignupPassword ? 'text' : 'password'} 
                            required 
                            value={signupPassword} 
                            onChange={(e) => setSignupPassword(e.target.value)}
                            className="pr-10"
                        />
                        <button 
                            type="button" 
                            className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-10 text-muted-foreground" 
                            onClick={() => setShowSignupPassword(prev => !prev)}
                            aria-label={showSignupPassword ? "Hide password" : "Show password"}
                        >
                            {showSignupPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                  </div>
                   <div className="grid gap-2">
                    <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                    <div className="relative">
                        <Input 
                            id="signup-confirm-password" 
                            type={showConfirmPassword ? 'text' : 'password'} 
                            required 
                            value={signupConfirmPassword} 
                            onChange={(e) => setSignupConfirmPassword(e.target.value)}
                            className="pr-10"
                        />
                        <button 
                            type="button" 
                            className="absolute inset-y-0 right-0 flex items-center justify-center h-full w-10 text-muted-foreground" 
                            onClick={() => setShowConfirmPassword(prev => !prev)}
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                    </div>
                  </div>
                  {authError && <p className="text-sm text-destructive">{authError}</p>}
                  <Button type="submit" className="w-full" disabled={loading}>
                     {loading ? <LoaderCircle className="animate-spin" /> : 'Sign Up'}
                  </Button>
                </form>
                 <div className="mt-4 text-center text-sm relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-background px-2 text-muted-foreground">Or sign up with</span>
                    </div>
                </div>
                <Button variant="outline" className="w-full mt-4" onClick={handleGoogleSignIn} disabled={loading}>
                  Sign up with Google
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
