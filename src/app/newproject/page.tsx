"use client";

import { useReducer } from "react";
import { useRouter } from "next/navigation";
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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import Link from "next/link";
import { 
    Loader2, 
    FolderKanban, 
    FileText, 
    User, 
    Users, 
    BookOpen, 
    Layers 
} from "lucide-react";

type State = {
    name: string;
    description: string;
    teamLeader: string;
    membres: string[];
    sujet: string;
    loading: boolean;
};

type Action = 
    | { type: "SET_FIELD"; field: keyof State; value: string | boolean | string[] }
    | { type: "SET_LOADING"; value: boolean };

const initialState: State = {
    name: "",
    description: "",
    teamLeader: "",
    membres: [],
    sujet: "",
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

export default function NewProjectPage() {
    const [state, dispatch] = useReducer(reducer, initialState);
    const { push } = useRouter();

    const handleNewProject = async (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: "SET_LOADING", value: true });

        try {
            //inserer dans bdd
            
    
            push("/project");
            dispatch({ type: "SET_LOADING", value: false });
        } catch (error) {
            alert("Une erreur est survenue lors de la création du projet.");
            dispatch({ type: "SET_LOADING", value: false });
        }
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
                        <CardTitle className="text-4xl font-black tracking-tighter text-secondary flex items-center gap-2 justify-center">
                            <FolderKanban className="size-8 text-secondary" /> Project Isen Manager Planner
                        </CardTitle>
                        <CardDescription className="text-muted-foreground font-semibold uppercase tracking-wider text-xs">
                            Nouveau Projet
                        </CardDescription>
                    </div>
                </CardHeader>
                
                <form onSubmit={handleNewProject}>
                    <CardContent className="grid gap-6 sm:grid-cols-2 pt-8">
                        
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="name" className="text-secondary/80 font-bold">Nom du projet</Label>
                            <div className="relative">
                                <FolderKanban className="absolute left-3 top-3 size-4 text-secondary/40" />
                                <Input
                                    id="name"
                                    placeholder="Ex: Projet d'informatique de 3e année"
                                    className="pl-10 h-10 border-2 border-secondary/10 focus-visible:ring-secondary focus-visible:border-secondary hover:border-secondary/30 transition-colors"
                                    value={state.name}
                                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "name", value: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="description" className="text-secondary/80 font-bold">Description du projet</Label>
                            <div className="relative">
                                <FileText className="absolute left-3 top-3 size-4 text-secondary/40" />
                                <Textarea
                                    id="description"
                                    placeholder="Objectifs, composition, attendus..."
                                    className="pl-10 min-h-[100px] border-2 border-secondary/10 focus-visible:ring-secondary focus-visible:border-secondary hover:border-secondary/30 transition-colors"
                                    value={state.description}
                                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "description", value: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        
                        <div className="space-y-2">
                            <Label htmlFor="teamLeader" className="text-secondary/80 font-bold">Team Leader</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 size-4 text-secondary/40" />
                                <Input
                                    id="teamLeader"
                                    placeholder="Nom du team leader"
                                    className="pl-10 h-10 border-2 border-secondary/10 focus-visible:ring-secondary focus-visible:border-secondary hover:border-secondary/30 transition-colors"
                                    value={state.teamLeader}
                                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "teamLeader", value: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                       
                        <div className="space-y-2">
                            <Label htmlFor="membres" className="text-secondary/80 font-bold">Membres de l'équipe</Label>
                            <div className="relative">
                                <Users className="absolute left-3 top-3 size-4 text-secondary/40" />
                                <Input
                                    id="membres"
                                    placeholder="Séparés par une virgule"
                                    className="pl-10 h-10 border-2 border-secondary/10 focus-visible:ring-secondary focus-visible:border-secondary hover:border-secondary/30 transition-colors"
                                    value={state.membres.join(", ")}
                                    onChange={(e) => dispatch({ type: "SET_FIELD", field: "membres", value: e.target.value.split(", ") })}
                                    required
                                />
                            </div>
                        </div>
                        
                        
                        <div className="space-y-2 sm:col-span-2">
                            <Label htmlFor="sujet" className="text-secondary/80 font-bold">Sujet</Label>
                            <Select 
                                value={state.sujet} 
                                onValueChange={(value) => dispatch({ type: "SET_FIELD", field: "sujet", value })}
                            >
                                <SelectTrigger className="h-10 pl-10 relative border-2 border-secondary/10 focus:ring-secondary focus:border-secondary hover:border-secondary/30 transition-colors">
                                    <BookOpen className="absolute left-3 top-3 size-4 text-secondary/40" />
                                    <SelectValue placeholder="Sélectionnez le sujet" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="1" className="focus:bg-secondary/10 focus:text-secondary">
                                        <div className="flex items-center gap-2">
                                            <Layers className="size-4" />
                                            <span>Sujet proposé par prof</span>
                                        </div>
                                    </SelectItem>
                                    
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
                                "CRÉER LE PROJET"
                            )}
                        </Button>
                        
                        <div className="text-sm text-center font-bold">
                            <Link href="/index" className="text-muted-foreground hover:text-secondary transition-colors underline decoration-2 underline-offset-4">
                                RETOUR À LA LISTE DES PROJETS
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}