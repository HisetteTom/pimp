"use client";

import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle,
    CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, FolderKanban, Users, LayoutDashboard, FileText } from "lucide-react";

export default function DashboardGridPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-background border-t-8 border-secondary space-y-6">
            
            
            <div className="flex flex-col items-center gap-y-2 mt-4">
                <Image
                    src="/pimp_logo.png"
                    alt="PIMP Logo"
                    width={80}
                    height={80}
                />
                <h1 className="text-2xl font-black tracking-tighter text-secondary flex items-center gap-2">
                    <LayoutDashboard className="size-6" /> Gérer le projet
                </h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-6xl">
                
                <Card className="border-2 border-secondary/10 shadow-xl bg-card flex flex-col justify-between">
                    <CardHeader className="border-b border-secondary/5 pb-4">
                        <h4>Progression : 74%</h4>{/*ajouter barre de progression*/}
                    </CardHeader>
                    
                    <CardContent className="pt-6 space-y-2 text-sm font-medium text-foreground/80 flex-grow">
                        <h4>Taches urgentes :</h4>
                        <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                        <li>Tache 1</li>
                        <li>Tache 2</li>
                        <li>Tache 3</li>
                        </ul>

                        
                    </CardContent>

                    <CardFooter className="pt-4 border-t border-secondary/5 bg-secondary/[0.02] grid grid-cols-2 gap-3">
                        
                        <Button asChild size="sm" className="w-full bg-secondary text-secondary-foreground font-bold text-xs uppercase tracking-wider">
                            <Link href="/projects">Calendrier</Link>
                        </Button>
                        
                        <Button asChild size="sm" className="w-full bg-secondary text-secondary-foreground font-bold text-xs uppercase tracking-wider">
                            <Link href="/projects">Tâches</Link>
                        </Button>
                        
                        <Button asChild size="sm" className="w-full bg-secondary text-secondary-foreground font-bold text-xs uppercase tracking-wider">
                            <Link href="/projects">Rendus</Link>
                        </Button>
                        
                        <Button asChild size="sm" className="w-full bg-secondary text-secondary-foreground font-bold text-xs uppercase tracking-wider">
                            <Link href="/projects">Ressources</Link>
                        </Button>

                    </CardFooter>
                </Card>

                <Card className="border-2 border-secondary/10 shadow-xl bg-card flex flex-col justify-between">
                    <CardHeader className="border-b border-secondary/5 pb-4">
                        <CardTitle className="text-xl font-black tracking-tighter text-secondary flex items-center gap-2">
                            <FileText className="size-5" /> Nom du projet
                        </CardTitle>
                        <CardDescription className="font-semibold uppercase tracking-wider text-[10px]">
                            Description
                        </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="pt-6 space-y-2 text-sm font-medium text-foreground/80 flex-grow">
                        <h4>Membres :</h4>
                        <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                            <li>Membre 1</li>
                            <li>Membre 2</li>
                            <li>Membre 3</li>
                        </ul>
                        <br></br>
                        <h4>Team Leader : </h4>
                        <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                        <li>Team Leader</li></ul>
                        <br></br>
                        <h4>Enseignants :</h4>
                        <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                            <li>Enseignant 1</li>
                        </ul>
                        <br></br>
                        <h4>Jury :</h4>
                        <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                            <li>Jury 1</li>
                            <li>Jury 2</li>
                        </ul>
                        <br></br>
                        <h4> A rendre le 2 février</h4>
                    </CardContent>

                    <CardFooter className="pt-4 border-t border-secondary/5 bg-secondary/[0.02]">
                        <CardDescription >Etat du projet</CardDescription>
                    </CardFooter>
                </Card>

            </div>

            <div className="w-full max-w-4xl flex justify-start pt-2">
                <Link href="projects" className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground hover:text-secondary transition-colors underline decoration-2 underline-offset-4">
                    <ArrowLeft className="size-4" /> Retour aux projets
                </Link>
            </div>

        </div>
    );
}