import { AnimatePresence, motion } from "motion/react";
import useMeasure from "react-use-measure";
import { CardContent, CardFooter } from "./ui/card";
import { useForm } from "react-hook-form";
import { FormValues } from "./ReactHookForm";
import { Dispatch, JSX, SetStateAction, useState } from "react";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { LoaderIcon } from "lucide-react";

export const AnimatedFormWrapper = ({
  children,
}: {
  children: JSX.Element;
}) => {
  const [ref, bounds] = useMeasure();

  return (
    <motion.div className="overflow-hidden" animate={{ height: bounds.height }}>
      <CardContent ref={ref}>
        <AnimatePresence mode="popLayout">{children}</AnimatePresence>
      </CardContent>
    </motion.div>
  );
};

type NavigationButtonsProps = {
  isPending: boolean;
  form: ReturnType<typeof useForm<FormValues>>;
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  setModifier: Dispatch<SetStateAction<number>>;
};
export const NavigationButtons = ({
  step,
  isPending,
  form,
  setStep,
  setModifier,
}: NavigationButtonsProps) => {
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(true);

  const handleNextClicked = async () => {
    let isValid: boolean = false;
    switch (step) {
      case 0:
        isValid = await form.trigger(["email", "password"]);
        break;
      case 1:
        isValid = await form.trigger([
          "firstName",
          "lastName",
          "experience",
          "other",
        ]);
        break;
    }
    if (!isValid)
      return toast.error("Form is invalid", {
        richColors: true,
      });
    setModifier(1);
    setStep(step + 1);

    // Necessary because submit event is being triggered
    if (step == 1) setTimeout(() => setIsSubmitDisabled(false), 1000);
  };

  return (
    <motion.div layout>
      <CardFooter className="my-2 space-x-4">
        <Button
          type="button"
          onClick={() => {
            setModifier(-1);
            setStep(step - 1);
            setIsSubmitDisabled(true);
          }}
          className="cursor-pointer disabled:cursor-not-allowed"
          variant="secondary"
          disabled={step <= 0}
        >
          Back
        </Button>
        {step === 2 ? (
          <Button
            disabled={isSubmitDisabled || isPending}
            className="cursor-pointer"
            type="submit"
          >
            <motion.span
              initial={{ y: -25 }}
              animate={{ y: 0 }}
              exit={{ y: 25 }}
              key={String(isPending)}
            >
              {isPending ? (
                <span className="animate-spin">
                  <LoaderIcon />
                </span>
              ) : (
                <span>Submit</span>
              )}
            </motion.span>
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleNextClicked}
            className="my-2 cursor-pointer"
          >
            Next
          </Button>
        )}
      </CardFooter>
    </motion.div>
  );
};
