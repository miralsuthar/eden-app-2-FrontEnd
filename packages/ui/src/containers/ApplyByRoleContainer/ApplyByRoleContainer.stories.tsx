import { getProject } from "@eden/package-mock";
import { ComponentMeta, ComponentStory } from "@storybook/react";

import { ApplyByRoleContainer } from "./";

export default {
  title: "Containers/ApplyByRoleContainer",
  component: ApplyByRoleContainer,
  argTypes: {},
} as ComponentMeta<typeof ApplyByRoleContainer>;

const Template: ComponentStory<typeof ApplyByRoleContainer> = (args) => (
  <ApplyByRoleContainer {...args} />
);

export const Default = Template.bind({});
Default.args = {
  project: getProject(),
};
