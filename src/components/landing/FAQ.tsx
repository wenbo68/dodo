"use client";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { BiMinus, BiPlus } from "react-icons/bi";

import SectionTitle from "./SectionTitle";
import { faqs } from "@/data/faq";

const FAQ: React.FC = () => {
  return (
    <section id="faq" className="py-10 lg:py-20">
      <div className="flex flex-col gap-10 lg:flex-row">
        <div className="">
          <p className="hidden text-foreground-accent lg:block">FAQ&apos;S</p>
          <SectionTitle>
            <h2 className="my-3 text-center !leading-snug lg:max-w-sm lg:text-left">
              Frequently Asked Questions
            </h2>
          </SectionTitle>
          <p className="text-center text-foreground-accent lg:mt-10 lg:text-left">
            Ask us anything!
          </p>
          <a
            href="mailto:"
            className="mt-3 block text-center text-xl font-semibold text-secondary hover:underline lg:text-left lg:text-4xl"
          >
            help@finwise.com
          </a>
        </div>

        <div className="mx-auto w-full border-b lg:max-w-2xl">
          {faqs.map((faq, index) => (
            <div key={index} className="mb-7">
              <Disclosure>
                {({ open }) => (
                  <div>
                    <DisclosureButton className="flex w-full items-center justify-between border-t px-4 pt-7 text-left text-lg">
                      <span className="text-2xl font-semibold">
                        {faq.question}
                      </span>
                      {open ? (
                        <BiMinus className="h-5 w-5 text-secondary" />
                      ) : (
                        <BiPlus className="h-5 w-5 text-secondary" />
                      )}
                    </DisclosureButton>
                    <DisclosurePanel className="px-4 pb-2 pt-4 text-foreground-accent">
                      {faq.answer}
                    </DisclosurePanel>
                  </div>
                )}
              </Disclosure>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
