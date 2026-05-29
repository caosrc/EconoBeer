import { Route, Switch } from "wouter";
import { Toaster } from "sonner";
import HomePage from "./pages/HomePage";
import ComparadorPage from "./pages/ComparadorPage";
import TonturometroPage from "./pages/TonturometroPage";
import RolePage from "./pages/RolePage";
import SuportePage from "./pages/SuportePage";

export default function App() {
  return (
    <>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/comparador" component={ComparadorPage} />
        <Route path="/tonturometro" component={TonturometroPage} />
        <Route path="/role" component={RolePage} />
        <Route path="/suporte" component={SuportePage} />
      </Switch>
      <Toaster richColors position="top-right" />
    </>
  );
}
