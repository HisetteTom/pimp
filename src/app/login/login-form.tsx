"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Mail, Lock } from "lucide-react";

export function LoginForm() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { push } = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const { data, error } = await authClient.signIn.email({
            email,
            password,
        });

        if (error) {
            alert(error.message);
        } else {
            push("/");
        }
        setLoading(false);
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background border-t-8 border-primary">
            <Card className="w-full max-w-md border-2 border-primary/10 shadow-xl bg-card">
                <CardHeader className="flex flex-col items-center gap-y-4 pb-8 border-b border-primary/5">
                    <div className="p-2">
                        <Image
                            src="/pimp_logo.png"
                            alt="PIMP Logo"
                            width={120}
                            height={120}
                        />
                    </div>
                    <div className="text-center space-y-1">
                        <CardTitle className="text-4xl font-black tracking-tighter text-primary">
                            Project Isen Manager Planner
                        </CardTitle>
                        <CardDescription className="text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                            Login Area
                        </CardDescription>
                    </div>
                </CardHeader>
                <form onSubmit={handleLogin}>
                    <CardContent className="space-y-4 pt-8">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-primary/80 font-bold">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 size-4 text-primary/40" />
                                <Input
                                    id="email"
                                    type="email"
                                    className="pl-10 h-11 border-2 focus-visible:ring-primary border-primary/10 hover:border-primary/30 transition-colors"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-primary/80 font-bold">Password</Label>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 size-4 text-primary/40" />
                                <Input
                                    id="password"
                                    type="password"
                                    className="pl-10 h-11 border-2 focus-visible:ring-primary border-primary/10 hover:border-primary/30 transition-colors"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-6 pt-4 pb-8">
                        <Button 
                            type="submit" 
                            className="w-full h-12 text-base font-black bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-[4px_4px_0px_0px_rgba(var(--primary-rgb),0.2)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none" 
                            disabled={loading}
                        >
                            {loading ? (
                                <Loader2 className="size-5 animate-spin" />
                            ) : (
                                "SIGN IN"
                            )}
                        </Button>
                        <div className="text-sm text-center font-bold">
                            <span className="text-muted-foreground uppercase tracking-tight">No account? </span>
                            <Link href="/register" className="text-secondary hover:text-primary transition-colors underline decoration-2 underline-offset-4">
                                CREATE A PROFILE
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
