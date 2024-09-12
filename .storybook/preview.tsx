import type { Decorator, Preview } from "@storybook/react";
import Providers from "../src/providers/providers";
import React from "react";

const withProviders: Decorator = (Story, context) => {
  return (
    <Providers>
      <Story {...context} />
    </Providers>
  );
};
const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    actions: { argTypesRegex: "^on[A-Z].*" },
  },
  decorators: [withProviders],
};

export default preview;
