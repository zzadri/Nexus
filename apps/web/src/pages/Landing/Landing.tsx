import React from "react";
import {
  FaCode,
  FaShieldAlt,
  FaUsers,
  FaRocket,
  FaBookOpen,
  FaLightbulb,
  FaGraduationCap,
  FaBuilding,
  FaChevronRight,
  FaGithub,
  FaLinkedin,
  FaChevronDown,
} from "react-icons/fa";
import { FeatureCard } from "@/shared/ui/FeatureCard";
import { UseCaseCard } from "@/shared/ui/UseCaseCard";

const Landing: React.FC = () => {
  const scrollToFeatures = () => {
    const element = document.getElementById('features');
    if (element) {
      const targetPosition = element.offsetTop + 50;
      const startPosition = window.pageYOffset;
      const distance = targetPosition - startPosition;
      const duration = 1500;
      let start: number | null = null;

      function step(timestamp: number) {
        if (!start) start = timestamp;
        const progress = Math.min((timestamp - start) / duration, 1);

        // Easing function pour un mouvement plus fluide
        const ease = progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        window.scrollTo(0, startPosition + distance * ease);

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      }

      requestAnimationFrame(step);
    }
  };

  return (
    <main className="bg-slate-900 text-slate-100 min-h-screen scroll-smooth">
      {/* HERO */}
      <section className="relative overflow-clip">
        {/* Background avec dégradé responsive */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-indigo-900/70 to-slate-900"></div>
        <div className="hidden md:block absolute inset-0" style={{
          background: 'linear-gradient(180deg, rgb(15 23 42) 0%, rgba(30 58 138, 0.6) 25%, rgba(88 28 135, 0.2) 50%, rgba(15 23 42, 0.8) 75%, rgb(15 23 42) 100%)',
          height: '180vh'
        }}></div>
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: `
              radial-gradient(60rem 30rem at 20% 15%, rgba(59,130,246,.10) 0%, transparent 60%),
              radial-gradient(60rem 30rem at 80% 70%, rgba(147,51,234,.10) 0%, transparent 60%)
            `,
            height: '200vh'
          }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 pt-20 md:pt-28 lg:pt-32 pb-20 md:pb-24 lg:pb-28 xl:pb-32 2xl:pb-36">
          <div className="mb-6 flex items-center justify-center">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-100 text-xs sm:text-sm">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              Plateforme en développement actif
            </span>
          </div>
          <h1 className="text-center font-black leading-tight text-4xl xs:text-5xl sm:text-6xl md:text-7xl xl:text-8xl bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent">
            Le réseau social{" "}
            <br className="hidden sm:block" />
            <span className="text-blue-400">des développeurs</span>
          </h1>
          <p className="mt-6 sm:mt-8 text-base sm:text-lg md:text-xl text-slate-300 max-w-3xl mx-auto text-center leading-relaxed">
            Partagez vos connaissances, créez de la documentation collaborative
            et restez à la pointe de la technologie avec votre communauté.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center sm:items-stretch">
            <a
              href="/register"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-blue-500 font-semibold text-lg shadow-lg hover:shadow-blue-500/25 hover:from-blue-500 hover:to-blue-400 transition-all duration-300"
            >
              Commencer gratuitement
              <FaChevronRight className="transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="/login"
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border-2 border-slate-600 font-semibold text-lg hover:border-blue-500 hover:bg-blue-500/10 transition-all duration-300"
            >
              Se connecter
            </a>
          </div>
          <div className="mt-10 md:mt-12 lg:mt-14 xl:mt-16 flex justify-center">
            <button
              onClick={scrollToFeatures}
              className="group inline-flex items-center justify-center w-12 h-12 rounded-full border border-slate-600/60 hover:border-blue-500/60 hover:bg-blue-500/10 transition-all duration-300 animate-bounce"
              aria-label="Aller aux fonctionnalités"
            >
              <FaChevronDown className="text-slate-300 group-hover:text-blue-300 transition-colors" />
            </button>
          </div>
        </div>
        <div
          aria-hidden
          className="absolute bottom-0 left-0 right-0 h-24 sm:h-28 md:h-32"
          style={{
            background:
              "linear-gradient(180deg, rgba(15,23,42,0.0) 0%, rgba(15,23,42,0.65) 60%, rgba(15,23,42,1) 100%)",
          }}
        />
      </section>

      {/* FEATURES */}
      <section id="features" className="relative z-10 py-20 sm:py-24 md:py-32 lg:py-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <header className="text-center mb-10 sm:mb-14 md:mb-16">
            <h2 className="text-2xl sm:3xl md:text-4xl lg:text-5xl font-extrabold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
              Conçu pour les professionnels de l’IT
            </h2>
            <p className="mt-4 sm:mt-5 text-slate-400 text-base sm:text-lg max-w-3xl mx-auto">
              Une plateforme sécurisée qui répond aux besoins des développeurs, étudiants et équipes tech.
            </p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard
              icon={<FaCode className="text-blue-400 text-2xl" />}
              iconBgClass="bg-blue-500/10 border-blue-500/20"
              hoverBorderClass="hover:border-blue-500/50"
              title="Documentation collaborative"
              description="Créez et maintenez de la documentation technique en équipe. Markdown, code highlighting et versioning."
            />
            <FeatureCard
              icon={<FaShieldAlt className="text-green-400 text-2xl" />}
              iconBgClass="bg-green-500/10 border-green-500/20"
              hoverBorderClass="hover:border-green-500/50"
              title="Sécurité enterprise"
              description="2FA TOTP, CSRF, sessions sécurisées. Audit continu (SonarQube, Snyk) pour une sécurité maximale."
            />
            <FeatureCard
              icon={<FaUsers className="text-purple-400 text-2xl" />}
              iconBgClass="bg-purple-500/10 border-purple-500/20"
              hoverBorderClass="hover:border-purple-500/50"
              title="Groupes intelligents"
              description="Créez des espaces pour vos équipes, classes ou projets. Permissions fines et analytics."
            />
            <FeatureCard
              icon={<FaLightbulb className="text-orange-400 text-2xl" />}
              iconBgClass="bg-orange-500/10 border-orange-500/20"
              hoverBorderClass="hover:border-orange-500/50"
              title="Veille technologique"
              description="Restez à jour : tags, recherche avancée et recommandations personnalisées."
            />
            <FeatureCard
              icon={<FaBookOpen className="text-cyan-400 text-2xl" />}
              iconBgClass="bg-cyan-500/10 border-cyan-500/20"
              hoverBorderClass="hover:border-cyan-500/50"
              title="Transfert de compétences"
              description="Partage de tutoriels, vidéos et guides pratiques. Feedback intégré."
            />
            <FeatureCard
              icon={<FaRocket className="text-pink-400 text-2xl" />}
              iconBgClass="bg-pink-500/10 border-pink-500/20"
              hoverBorderClass="hover:border-pink-500/50"
              title="Performance optimisée"
              description="Stack moderne React + Node.js. UI fluide, chargements rapides, UX soignée."
            />
          </div>
        </div>
      </section>

      {/* USE CASES */}
      <section className="relative z-10 py-20 sm:py-24 md:py-32 lg:py-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <header className="text-center mb-10 sm:mb-14 md:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold">Pour qui ?</h2>
            <p className="mt-4 sm:mt-5 text-slate-400 text-base sm:text-lg max-w-3xl mx-auto">
              Une solution adaptée à tous les environnements d’apprentissage et de travail.
            </p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <UseCaseCard
              tone="blue"
              icon={<FaGraduationCap className="text-blue-400 text-2xl" />}
              title="Écoles & Universités"
              description="Professeurs et étudiants collaborent sur des projets, partagent des ressources et maintiennent une base de connaissances vivante."
              bullets={[
                "Gestion de classes et groupes de travail",
                "Suivi des contributions et engagement",
                "Bibliothèque de ressources pédagogiques",
              ]}
            />
            <UseCaseCard
              tone="purple"
              icon={<FaBuilding className="text-purple-400 text-2xl" />}
              title="Entreprises Tech"
              description="Équipes qui documentent leurs processus, partagent les bonnes pratiques et forment les nouveaux arrivants."
              bullets={[
                "Documentation technique centralisée",
                "Onboarding et formation continue",
                "Analytics et métriques d’équipe",
              ]}
            />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 md:py-14 px-6 lg:px-10 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Nexus
              </h3>
              <p className="text-slate-500">Le réseau social des développeurs et professionnels IT</p>
            </div>
            <div className="flex gap-4">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors">
                <FaGithub className="text-xl text-slate-300" />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 transition-colors">
                <FaLinkedin className="text-xl text-slate-300" />
              </a>
            </div>
          </div>
          <p className="mt-8 text-center text-slate-500">© {new Date().getFullYear()} Nexus. Tous droits réservés.</p>
        </div>
      </footer>
    </main>
  );
};

export default Landing;
