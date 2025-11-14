import StakeHomePage from "@/components/pages/StakeHomePage";
import StakeLayout from "@/components/layout/StakeLayout";

export default function Home() {
  return (
    <StakeLayout showSidebar={false}>
      <StakeHomePage />
    </StakeLayout>
  );
}
