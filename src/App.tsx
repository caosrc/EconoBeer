import { Route, Switch } from "wouter";
import { Toaster } from "sonner";
import HomePage from "./pages/HomePage";
import ComparadorPage from "./pages/ComparadorPage";
import TonturometroPage from "./pages/TonturometroPage";
import CatalogoPage from "./pages/CatalogoPage";
import RolePage from "./pages/RolePage";

export default function App() {
  return (
    <>
      <Switch>
        <Route path="/" component={HomePage} />
        <Route path="/comparador" component={ComparadorPage} />
        <Route path="/tonturometro" component={TonturometroPage} />
        <Route path="/catalogo" component={CatalogoPage} />
        <Route path="/role" component={RolePage} />
      </Switch>
      <Toaster richColors position="top-right" />
    </>
  );
}
