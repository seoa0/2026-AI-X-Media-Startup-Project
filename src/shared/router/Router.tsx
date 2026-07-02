import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from '../../pages/landing/Landing';
import Home from '../../pages/home/Home';
import Login from '../../pages/login/Login';
import Signup from '../../pages/signup/Signup';
import ChatOnboarding from '../../pages/onboarding/ChatOnboarding';
import PackageSelect from '../../pages/packages/PackageSelect';
import StorySourceSelect from '../../pages/story-source/StorySourceSelect';
import Create from '../../pages/create/Create';
import LyricsMaking from '../../pages/lyrics-making/LyricsMaking';
import Lyrics from '../../pages/lyrics/Lyrics';
import ProductionWaiting from '../../pages/production/ProductionWaiting';
import ProductionComplete from '../../pages/production/ProductionComplete';
import ProductionList from '../../pages/production/ProductionList';
import FontSizeSettings from '../../pages/settings/FontSizeSettings';
import My from '../../pages/my/My';

export default function Router() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/home" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/onboarding/chat" element={<ChatOnboarding />} />
      <Route path="/packages" element={<PackageSelect />} />
      <Route path="/story-source/:songId" element={<StorySourceSelect />} />
      <Route path="/create/:songId" element={<Create />} />
      <Route path="/lyrics-making/:songId" element={<LyricsMaking />} />
      <Route path="/lyrics/:songId" element={<Lyrics />} />
      <Route path="/production/waiting/:songId" element={<ProductionWaiting />} />
      <Route path="/production/complete/:songId" element={<ProductionComplete />} />
      <Route path="/create" element={<Navigate to="/home" replace />} />
      <Route path="/production" element={<ProductionList />} />
      <Route path="/settings/font-size" element={<FontSizeSettings />} />
      <Route path="/my" element={<My />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
