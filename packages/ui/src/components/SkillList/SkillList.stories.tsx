import { ComponentMeta, ComponentStory } from "@storybook/react";

import { SkillList } from "./SkillList";

export default {
  title: "Components/SkillList",
  component: SkillList,
  argTypes: {},
} as ComponentMeta<typeof SkillList>;

const Template: ComponentStory<typeof SkillList> = (args) => (
  <SkillList {...args} />
);

export const Default = Template.bind({});

Default.args = {
  colorRGB: "215,215,255",
  skills: [
    {
      skillInfo: {
        _id: "1",
        name: "skill1",
      },
    },
    {
      skillInfo: {
        _id: "2",
        name: "skill2",
      },
    },
    {
      skillInfo: {
        _id: "3",
        name: "skill3",
      },
    },
    {
      skillInfo: {
        _id: "4",
        name: "skill4",
      },
    },
    {
      skillInfo: {
        _id: "5",
        name: "skill5",
      },
    },
    {
      skillInfo: {
        _id: "6",
        name: "skill6",
      },
    },
    {
      skillInfo: {
        _id: "7",
        name: "skill7",
      },
    },
  ],
};
