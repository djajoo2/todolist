import './App.css';
import Header from './components/Header';
import Main from './components/Main';

function App() {
  return (
    <>
    <Header></Header>
      <div className='content justify-center flex'>
        <Main></Main>
      </div>
    </>
  )
}

export default App