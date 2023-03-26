import { Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import * as MikuCore from "@mikugg/core";

const classNames = (...classes: any) => {
  return classes.filter(Boolean).join(" ");
};

interface dropDownProps {
  items: string[]
  onChange: (index: number) => void;
  selectedIndex: number;
}

export const DropDown = ({
  items,
  onChange,
  selectedIndex
}: dropDownProps) => {
  return (
    <Menu as="div" className="flex flex-col-reverse z-10 text-left relative min-w-[150px]">
      <Menu.Button className="inline-flex justify-center button-transparent px-4 py-2 text-sm font-medium">
        {items[selectedIndex]}
        <ChevronDownIcon className="-mr-1 ml-2 h-5 w-5" aria-hidden="true" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="text-white rounded-md absolute bottom-12 w-full">
          <div className="overflow-hidden bg-[#0e0c20] w-full">
            {items.map((item, index) => (
              <Menu.Item key={`item-${item}-${index}`}>
                <button
                  className={classNames(
                    selectedIndex === index
                      ? "bg-violet-800"
                      : "",
                    "block px-4 py-2 text-sm w-full text-left hover:bg-violet-700 transition-all"
                  )}
                  onClick={() => onChange(index)}
                >
                  {item}
                </button>
              </Menu.Item>
            ))}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
};
