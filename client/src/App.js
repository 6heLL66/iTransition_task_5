import { Switch, Route, Redirect, BrowserRouter } from 'react-router-dom'
import MainPage from './MainPage.js'
import GamePage from './GamePage.js'

function App() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" exact><MainPage /></Route>
        <Route path="/game/:id" exact><GamePage /></Route>
        <Redirect to="/" />
      </Switch>
    </BrowserRouter>
  );
}

export default App;
