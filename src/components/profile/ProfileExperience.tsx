import { Briefcase } from "lucide-react";
import { WobbleCard } from "../../components/ui/wobble-card";
import { TextGenerateEffect } from "../../components/ui/text-generate-effect";
import { ContainerScrollAnimation } from "../../components/ui/container-scroll-animation";

interface ProfileExperienceProps {
    experience?: string;
}

export const ProfileExperience = ({ experience }: ProfileExperienceProps) => {
    // HIDE IF EMPTY
    if (!experience) return null;

    return (
        <ContainerScrollAnimation direction="up" speed="normal">
            <section className="mb-16 sm:mb-20">
                <div className="text-center mb-12">
                    <div className="inline-flex items-center gap-2.5 bg-purple-500/5 border border-purple-500/10 rounded-full px-5 py-2 mb-6">
                        <Briefcase className="w-3.5 h-3.5 text-purple-600" />
                        <span className="text-xs font-medium text-purple-600 tracking-wide">Professional Summary</span>
                    </div>
                    <TextGenerateEffect
                        words="Experience"
                        className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-4 tracking-tight leading-[0.95]"
                        duration={1.5}
                    />
                </div>

                <WobbleCard className="max-w-4xl mx-auto border border-border/30 rounded-3xl hover:border-purple-500/20 hover:shadow-xl hover:shadow-purple-500/5 transition-all duration-700 bg-card/30 backdrop-blur-sm p-6 sm:p-10">
                    <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-muted-foreground leading-relaxed whitespace-pre-line">
                        {experience}
                    </div>
                </WobbleCard>
            </section>
        </ContainerScrollAnimation>
    );
};
