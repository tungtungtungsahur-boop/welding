
import Chat from "./Chat";
import ImageClassifier from "./ImageClassifier";

function App() {

  return (
    <>
      <div>
        <h1 className="flex justify-center items-center text-6xl font-bold text-primary h-[14vh] bg-background border-b-1 border-border">Weld Mentor</h1>
        <div className='flex flex-col lg:flex-row font-sans'>
          <div className="w-full lg:w-lg" >
            <ImageClassifier />
          </div>

          <div className='w-full border-l-1 border-background lg:border-border '>

            <Chat />
          </div>
        </div>
      </div>

    </>
  )
}

export default App
