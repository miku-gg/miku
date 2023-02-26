import ReactJson from "react-json-view"
import { useBot } from "../../libs/botLoader";

export const BotDetails = () =>{
    const { botConfig } = useBot();
    return(
        <>
            <p className="text-white text-2xl text-start m-4">Bot Details</p>
            <div className="max-w-96 scrollbar overflow-auto text-clip text-start">
                <ReactJson theme="ocean" src={botConfig || {}} collapseStringsAfterLength={10}/>
            </div>
        </>
    )
}