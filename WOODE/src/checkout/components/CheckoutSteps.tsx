import { FiCheck } from "react-icons/fi";
import type { CheckoutStep } from "../types/checkout.types";
import { CHECKOUT_STEPS } from "../constants/checkout.constant";

interface CheckoutStepsProps {
  step: CheckoutStep;
  onStepChange: (step: CheckoutStep) => void;
}

export default function CheckoutSteps({
  step,
  onStepChange,
}: CheckoutStepsProps) {
  return (
    <div className="mb-8 sm:mb-12">
      <h1 className="font-['Noto_Serif'] text-3xl sm:text-4xl font-bold text-white mb-6 sm:mb-8">
        Thanh toán
      </h1>

      <div className="flex gap-4 sm:gap-8 overflow-x-auto">
        {CHECKOUT_STEPS.map((item) => (
          <div
            key={item.id}
            className={`flex  items-center gap-2 sm:gap-3 flex-shrink-0 ${step > item.id ? "cursor-pointer" : "cursor-default"
              }`}
            onClick={() => step > item.id && onStepChange(item.id)}
          >
            <div
              className={`flex  h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full font-bold text-xs sm:text-sm transition ${item.id < step
                ? "bg-[#bd992d] text-white shadow-md"
                : item.id === step
                  ? "bg-[#bd992d] text-white outline-[#eadcae] shadow-md"
                  : "bg-[#e8dec0] text-[#5b4713]"
                }`}
            >
              {item.id < step ? <FiCheck size={18} /> : item.id}
            </div>

            <div className="hidden sm:block">
              <p className="text-xs uppercase tracking-wider text-[#d8c78d]">
                Bước {item.id}
              </p>
              <p
                className={`text-sm font-semibold ${item.id <= step ? "text-white" : "text-[#e8dec0]"
                  }`}
              >
                {item.title}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}