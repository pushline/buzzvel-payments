import { Head } from '@inertiajs/react';
import {
    CallToAction,
    ControlsSection,
    HeroSection,
    MarketingFooter,
    MarketingHeader,
    ProductSection,
    WorkflowSection,
} from './Welcome/Sections';

export default function Welcome({ auth }) {
    return (
        <>
            <Head title="Multi-currency payment request management" />

            <div className="min-h-screen bg-[#f6f7f9] text-slate-950">
                <MarketingHeader user={auth.user} />

                <main>
                    <HeroSection />
                    <ProductSection />
                    <WorkflowSection />
                    <ControlsSection />
                    <CallToAction />
                </main>

                <MarketingFooter />
            </div>
        </>
    );
}
