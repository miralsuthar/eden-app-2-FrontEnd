import { useMutation } from "@apollo/client";
import { UserContext } from "@eden/package-context";
import { UPDATE_MEMBER } from "@eden/package-graphql";
import {
  MatchSkillsToProjectsOutput,
  Maybe,
  Mutation,
  SkillRoleType,
} from "@eden/package-graphql/generated";
import {
  Avatar,
  Card,
  ProjectSkillFilterCard,
  UserProfileCard,
} from "@eden/package-ui";
import { useContext, useState } from "react";

import { round } from "../../../utils";

export interface ISignUpContainerSideProps {
  matchedProjects?: Maybe<Array<Maybe<MatchSkillsToProjectsOutput>>>;
  // eslint-disable-next-line no-unused-vars
  onSelectedProject: (projectID: string) => void;
  viewProject?: boolean;
}

export const SignUpContainerSide = ({
  matchedProjects,
  onSelectedProject,
  viewProject,
}: ISignUpContainerSideProps) => {
  const { currentUser } = useContext(UserContext);

  const [selectedProject, setSelectedProject] = useState<string | null>(null);

  const [updateMember] = useMutation(UPDATE_MEMBER, {
    onCompleted({ updateMember }: Mutation) {
      if (!updateMember) console.log("updateMember is null");
      // console.log("updateMember", updateMember);
    },
    onError(error) {
      console.log("error", error);
    },
  });

  return (
    <Card className={`h-85 flex flex-col gap-4`}>
      <UserProfileCard />
      {viewProject ? (
        <Card className={`scrollbar-hide flex flex-grow overflow-y-scroll`}>
          <div className={`my-1 flex flex-col gap-3`}>
            {matchedProjects?.map((matchProject, index: number) => (
              <button
                key={index}
                className={`flex w-full px-1`}
                onClick={() => {
                  onSelectedProject(matchProject?.project?._id || "");
                  setSelectedProject(matchProject?.project?._id || "");
                }}
              >
                <Card
                  focused={matchProject?.project?._id === selectedProject}
                  className={`flex w-full bg-white p-4`}
                >
                  <div className={`relative`}>
                    <Avatar isProject size={`xs`} />
                    {matchProject?.matchPercentage && (
                      <p className="font-poppins absolute -mt-6 ml-5 rounded-full bg-white px-1 text-xs font-semibold text-[#9B67FF]">
                        {round(Number(matchProject?.matchPercentage), 0)}%
                      </p>
                    )}
                  </div>
                  <div className={`pl-6`}>
                    <div>{matchProject?.project?.title}</div>
                    <div className={`text-xs`}>
                      {matchProject?.project?.description}
                    </div>
                  </div>
                </Card>
              </button>
            ))}
          </div>
        </Card>
      ) : (
        <Card
          className={`scrollbar-hide flex flex-grow overflow-y-scroll bg-white`}
        >
          <ProjectSkillFilterCard
            cardTypeProject={false}
            roles={[]}
            skills={
              currentUser?.skills?.map((skill) => ({
                skillData: {
                  _id: skill?.skillInfo?._id,
                  name: skill?.skillInfo?.name,
                },
                level: skill?.level,
              })) || []
            }
            handleSetSkills={(val: any) => {
              updateMember({
                variables: {
                  fields: {
                    _id: currentUser?._id,
                    skills: val.map((skill: Maybe<SkillRoleType>) => {
                      return {
                        id: skill?.skillData?._id,
                        level: skill?.level,
                      };
                    }),
                  },
                },
              });
            }}
            handleSetHoursPerWeek={(val) => {
              updateMember({
                variables: {
                  fields: {
                    _id: currentUser?._id,
                    hoursPerWeek: Number(val.target.value),
                  },
                },
              });
            }}
            handleDeleteSkill={(val: any) => {
              console.log("val", val);
            }}
          />
        </Card>
      )}
    </Card>
  );
};
