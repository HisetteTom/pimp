"use client";

import { useReducer } from "react";
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";
import { Loader2, AtSign, Mail, Lock, GraduationCap } from "lucide-react";

type State = {
    email: string;
    password: string;
    username: string;
    role: string;
    loading: boolean;
};

type Action = 
    | { type: "SET_FIELD"; field: keyof State; value: string | boolean }
    | { type: "SET_LOADING"; value: boolean };

const initialState: State = {
    email: "",
    password: "",
    username: "",
    role: "Étudiant",
    loading: false,
};

function reducer(state: State, action: Action): State {
    switch (action.type) {
        case "SET_FIELD":
            return { ...state, [action.field]: action.value };
        case "SET_LOADING":
            return { ...state, loading: action.value };
        default:
            return state;
    }
}

export function RegisterForm() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { push } = useRouter();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: "SET_LOADING", value: true });
        const { error } = await authClient.signUp.email({
            email: state.email,
            password: state.password,
            name: state.username,
            username: state.username,
            // @ts-ignore
            role: state.role,
        });

        if (error) {
            alert(error.message);
        } else {
            push("/dashboard/student");
        }
        dispatch({ type: "SET_LOADING", value: false });
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-background border-t-8 border-secondary">
            <Card className="w-full max-w-xl border-2 border-secondary/10 shadow-xl bg-card">
                <CardHeader className="flex flex-col items-center gap-y-4 pb-6 border-b border-secondary/5">
                    <div className="p-2">
                        <Image
                            src="/pimp_logo.png"
                            alt="PIMP Logo"
                            width={110}
                            height={110}
                        />
                    </div>
                    <div className="text-center space-y-1">
                        <CardTitle className="text-4xl font-black tracking-tighter text-secondary">
                            Project Isen Manager Planner
                        </CardTitle>
                        <CardDescription className="text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                            Inscription Plateforme
                        </CardDescription>
                    </div>
                </CardHeader>
                <form onSubmit={handleRegister}>
                    <CardContent className="grid gap-6 pt-8">
                        <div className="space-y-2">
                            <Label htmlFor="username" className="text-secondary/80 font-bold">Username</Label>
                            <div className="relative">
                                <AtSign className="absolute left-3 top-3 size-4 text-secondary/40" />
                                <Input
                                    id="username"
                                    className="pl-10 h-10 border-2 border-secondary/10 focus-visible:ring-secondary focus-visible:border-secondary hover:border-secondary/30 transition-colors"
                                    value={state.username}
                                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "username", value: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="email" className="text-secondary/80 font-bold">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 size-4 text-secondary/40" />
                                <Input
                                    id="email"
                                    type="email"
                                    className="pl-10 h-10 border-2 border-secondary/10 focus-visible:ring-secondary focus-visible:border-secondary hover:border-secondary/30 transition-colors"
                                    value={state.email}
                                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "email", value: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="password" className="text-secondary/80 font-bold">Mot de passe</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 size-4 text-secondary/40" />
                                <Input
                                    id="password"
                                    type="password"
                                    className="pl-10 h-10 border-2 border-secondary/10 focus-visible:ring-secondary focus-visible:border-secondary hover:border-secondary/30 transition-colors"
                                    value={state.password}
                                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "password", value: e.target.value })}
                                    required
                                />
                            </div>
                        </div>
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="role" className="text-secondary/80 font-bold">Votre rôle</Label>
                            <Select 
                                value={state.role} 
                                onValueChange={(value) => dispatch({ type: "SET_FIELD", field: "role", value })}
                            >
                                <SelectTrigger className="h-10 pl-10 relative border-2 border-secondary/10 focus:ring-secondary focus:border-secondary hover:border-secondary/30 transition-colors">
                                    <GraduationCap className="absolute left-3 top-3 size-4 text-secondary/40" />
                                    <SelectValue placeholder="Sélectionnez un rôle" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Étudiant" className="focus:bg-secondary/10 focus:text-secondary">Étudiant</SelectItem>
                                    <SelectItem value="Encadrant" className="focus:bg-secondary/10 focus:text-secondary">Encadrant</SelectItem>
                                    <SelectItem value="Jury" className="focus:bg-secondary/10 focus:text-secondary">Jury</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-6 pt-4 pb-8">
                        <Button 
                            type="submit" 
                            className="w-full h-12 text-base font-black bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-all shadow-[4px_4px_0px_0px_rgba(var(--secondary-rgb),0.2)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none" 
                            disabled={state.loading}
                        >
                            {state.loading ? (
                                <Loader2 className="size-5 animate-spin" />
                            ) : (
                                "CRÉER MON COMPTE"
                            )}
                        </Button>
                        <div className="text-sm text-center font-bold">
                            <span className="text-muted-foreground uppercase tracking-tight">Déjà inscrit ? </span>
                            <Link href="/login" className="text-primary hover:text-secondary transition-colors underline decoration-2 underline-offset-4">
                                SE CONNECTER
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
