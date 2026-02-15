import "./index.css";
import { Composition, staticFile } from "remotion";
import {
  CaptionedVideo,
  calculateCaptionedVideoMetadata,
  captionedVideoSchema,
} from "./CaptionedVideo";
import { Intro, introSchema } from "./Intro";
import { MainVideo, mainVideoSchema } from "./MainVideo";
import { calculateMainVideoMetadata } from "./MainVideo/calculateMainVideoMetadata";
// Each <Composition> is an entry in the sidebar!

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="Intro"
        component={Intro}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        schema={introSchema}
        defaultProps={{
          templateId: "template_1",
          title: "X Loạt cổ phiếu ngân hàng, chứng khoán tăng trần",
          brandName: "PSI.VN",
          tagline: "KÊNH KINH TẾ - XXX CHÍNH TRỊ - XÃ HỘI",
          url: "https://psi.vn",
          backgroundImage: staticFile("main/video_1/Intro.jpg"),
          gradientTopColor: "rgba(10, 10, 26, 0.7)",
          gradientBottomColor: "rgba(0, 0, 0, 0.85)",
          gradientOpacity: 1,
          showBackgroundPattern: true,
          backgroundPatternOpacity: 0.3,
          showTopLogo: true,
          topLogoX: 960,
          topLogoY: 30,
          topLogoSize: 80,
          showBrandLogo: true,
          brandSectionX: 80,
          brandSectionY: 1080,
          brandLogoSize: 100,
          brandNameSize: 120,
          brandNameColor: "#ffffff",
          accentColor: "#ffffff",
          taglineX: 80,
          taglineY: 1230,
          taglineSize: 28,
          taglineColor: "#ffffff",
          titleX: 80,
          titleY: 1390,
          titleSize: 64,
          titleColor: "#ffffff",
          showSocialIcons: true,
          socialSectionX: 40,
          socialSectionY: 1830,
          socialIconSize: 45,
          showFacebook: true,
          showTikTok: true,
          showYouTube: true,
          showInstagram: true,
          urlX: 0,
          urlSize: 32,
          urlColor: "#ffffff",
          showMoneyElement: true,
          moneyElementX: 140,
          moneyElementY: 1260,
          moneyElementSize: 400,
          moneyElementOpacity: 0.1,
          showProfitElement: true,
          profitElementX: 410,
          profitElementY: 1430,
          profitElementSize: 710,
          profitElementOpacity: 0.2,
          enableAudio: true,
          audioVolume: 0.3,
          animationSpeed: 1,
        }}
      />
      <Composition
        id="CaptionedVideo"
        component={CaptionedVideo}
        calculateMetadata={calculateCaptionedVideoMetadata}
        schema={captionedVideoSchema}
        width={1080}
        height={1920}
        defaultProps={{
          src: staticFile("sample-video.mp4"),
        }}
      />
      <Composition
        id="MainVideo"
        component={MainVideo}
        calculateMetadata={calculateMainVideoMetadata}
        schema={mainVideoSchema}
        defaultProps={{
          contentDirectory: "main/video_4",
          introProps: {
            templateId: "template_1",
            title: "Loạt cổ phiếu ngân hàng, chứng khoán tăng trần",
            brandName: "PSI.VN",
            tagline: "KÊNH KINH TẾ - CHÍNH TRỊ - XÃ HỘI",
            url: "https://psi.vn",
            backgroundImage: staticFile("main/video_4/image/Intro.jpg"),
            gradientTopColor: "rgba(10, 10, 26, 0.7)",
            gradientBottomColor: "rgba(0, 0, 0, 0.85)",
            gradientOpacity: 1,
            showBackgroundPattern: true,
            backgroundPatternOpacity: 0.7,
            showTopLogo: true,
            topLogoX: 960,
            topLogoY: 30,
            topLogoSize: 80,
            showBrandLogo: true,
            brandSectionX: 80,
            brandSectionY: 1080,
            brandLogoSize: 100,
            brandNameSize: 120,
            brandNameColor: "#ffffff",
            accentColor: "#ffffff",
            taglineX: 80,
            taglineY: 1230,
            taglineSize: 28,
            taglineColor: "#ffffff",
            titleX: 80,
            titleY: 1390,
            titleSize: 64,
            titleColor: "#ffffff",
            showSocialIcons: true,
            socialSectionX: 40,
            socialSectionY: 1830,
            socialIconSize: 45,
            showFacebook: true,
            showTikTok: true,
            showYouTube: true,
            showInstagram: true,
            urlX: 0,
            urlSize: 32,
            urlColor: "#ffffff",
            showMoneyElement: true,
            moneyElementX: 140,
            moneyElementY: 1260,
            moneyElementSize: 400,
            moneyElementOpacity: 0.1,
            showProfitElement: true,
            profitElementX: 410,
            profitElementY: 1430,
            profitElementSize: 710,
            profitElementOpacity: 0.2,
            enableAudio: false,
            audioVolume: 0.3,
            animationSpeed: 1,
          },
          images: [],
          videos: [],
          videoDurations: [],
          captions: [],
          introDurationInFrames: 150,
          imageDurationInFrames: 170,
        }}
      />
    </>
  );
};
