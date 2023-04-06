import { FunctionComponent } from "react";
import closerIconLightTheme from "../../assets/icons/closer.png";
import closerIconDarkTheme from "../../assets/icons/whitecloser.png";

type ReactChild = JSX.Element | React.ReactNode | React.ReactElement;
type closePopUpTypes =
  | React.MouseEventHandler<HTMLButtonElement>
  | FunctionComponent;

interface PopUpProps {
  children: ReactChild;
  closePopUpFunction: closePopUpTypes;
  isShowingPupUp: Boolean;
  footer?: ReactChild;
  className?: string;
  darkTheme?: Boolean;
}

export const PopUp = ({
  children,
  closePopUpFunction,
  isShowingPupUp,
  className,
  darkTheme,
  footer,
}: PopUpProps) => {
  return (
    <>
      {isShowingPupUp == true ? (
        <div className="flex flex-col items-center justify-center absolute top-0 left-0 w-full h-full bg-gray-500/[.7] z-50">
          <div
            className={`flex flex-col w-4/12 max-h-[75%] min-h-[75%] rounded-lg ${
              darkTheme ? "bg-[#272727]" : "bg-white"
            } p-2 ${className ? className : null} max-sm:w-9/12 max-lg:w-10/12`}
          >
            <div className="w-full flex justify-end">
              <button className="mr-1 mt-1 p-0" onClick={closePopUpFunction}>
                <img
                  src={darkTheme ? closerIconDarkTheme : closerIconLightTheme}
                />
              </button>
            </div>
            {children ? children : null}
            <div className="align-bottom">{footer ? footer : null}</div>
          </div>
        </div>
      ) : null}
    </>
  );
};
