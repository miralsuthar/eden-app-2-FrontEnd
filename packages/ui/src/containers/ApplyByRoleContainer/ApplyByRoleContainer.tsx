/* eslint-disable camelcase */
import { gql, useMutation } from "@apollo/client";
import { UserContext } from "@eden/package-context";
import { UPDATE_MEMBER } from "@eden/package-graphql";
import {
  MatchSkillsToProjectsOutput,
  Maybe,
  Members,
  Mutation,
  Project,
} from "@eden/package-graphql/generated";
import {
  Button,
  Card,
  ConfettiContainer,
  Dropdown,
  Loading,
  Modal,
  NumberCircle,
  ProjectChampion,
  ProjectInfo,
  RoleCard,
  TextArea,
  TextField,
  TextHeading1,
  TextHeading2,
  TextHeading3,
} from "@eden/package-ui";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { FaGithub, FaTelegram, FaTwitter } from "react-icons/fa";

import { timezones } from "../../../constants";
import { round } from "../../../utils";

const SET_APPLY_TO_PROJECT = gql`
  mutation ($fields: changeTeamMember_Phase_ProjectInput!) {
    changeTeamMember_Phase_Project(fields: $fields) {
      _id
    }
  }
`;

const SET_FAVORITE = gql`
  mutation ($fields: addFavoriteProjectInput!) {
    addFavoriteProject(fields: $fields) {
      _id
    }
  }
`;

export interface IApplyByRoleContainerProps {
  project?: Project;
  matchedProjects?: Maybe<Array<Maybe<MatchSkillsToProjectsOutput>>>;
  refetch?: () => void;
  loadingProject?: boolean;
  // eslint-disable-next-line no-unused-vars
  onViewProject: (val: boolean) => void;
}

export const ApplyByRoleContainer = ({
  project,
  matchedProjects,
  refetch,
  loadingProject,
  onViewProject,
}: IApplyByRoleContainerProps) => {
  const router = useRouter();
  const { currentUser } = useContext(UserContext);
  const [submitting, setSubmitting] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isRoleView, setIsRoleView] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [applied, setApplied] = useState(false);

  const [profileBio, setProfileBio] = useState(currentUser?.bio || "");
  const [timezone, setTimezone] = useState(currentUser?.timeZone || "");
  const [hoursPerWeek, setHoursPerWeek] = useState(
    currentUser?.hoursPerWeek || 0
  );
  const [twitterHandle, setTwitterHandle] = useState("");
  const [githubHandle, setGithubHandle] = useState("");
  const [telegramHandle, setTelegramHandle] = useState("");

  useEffect(() => {
    if (currentUser?.projects && currentUser?.projects.length > 0 && project) {
      currentUser?.projects.forEach((element) => {
        if (project?._id === element?.info?._id) {
          setIsFavorite(element?.favorite || false);
        }
      });
    }
  }, [currentUser?.projects, project]);

  const [changeTeamMember_Phase_Project, {}] = useMutation(
    SET_APPLY_TO_PROJECT,
    {
      onCompleted: () => {
        // console.log("onCompleted");
        if (refetch) refetch();
        setSubmitting(false);
      },
      onError: (error) => {
        console.log("onError", error);
      },
    }
  );

  const [addFavoriteProject, {}] = useMutation(SET_FAVORITE, {
    onCompleted({ addFavoriteProject }: Mutation) {
      if (!addFavoriteProject) console.log("addFavoriteProject is null");
      setSubmitting(false);
      setIsFavorite(!isFavorite);
    },
  });

  const [updateMember, {}] = useMutation(UPDATE_MEMBER, {
    onCompleted({ updateMember }: Mutation) {
      if (!updateMember) console.log("updateMember is null");
    },
  });

  const handleApply = async () => {
    setSubmitting(true);
    updateMember({
      variables: {
        fields: {
          // serverID: "alpha-test", // don't need this anymore
          _id: currentUser?._id,
          bio: profileBio,
          hoursPerWeek: hoursPerWeek,
          timeZone: timezone,
          links: [
            {
              name: "twitter",
              url: twitterHandle ? `https://twitter.com/${twitterHandle}` : "",
            },
            {
              name: "github",
              url: githubHandle ? `https://github.com/${githubHandle}` : "",
            },
            {
              name: "telegram",
              url: telegramHandle,
            },
          ],
        },
      },
    });
    changeTeamMember_Phase_Project({
      variables: {
        fields: {
          projectID: project?._id,
          memberID: currentUser?._id,
          phase: "engaged",
        },
      },
    });
    setApplied(true);
  };

  const matchedProject = matchedProjects?.find(
    (matched) => matched?.project?._id === project?._id
  );

  // if (project) console.log("project", project);

  const zeroMatchedProjects = project?.role?.filter(
    // @ts-ignore
    (role) => role?._id !== matchedProject?.projectRoles[0]?.projectRole?._id
  );

  if (loadingProject)
    return (
      <Card className={`h-85 bg-white px-6 py-6`}>
        <Loading />
      </Card>
    );

  return (
    <Card className={`h-85 flex flex-col bg-white px-6 py-4`}>
      <div className={`flex justify-end`}>
        <button
          onClick={() => onViewProject(false)}
          className={`text-slate-500 underline`}
        >
          grid view
        </button>
      </div>
      <div className={`grid grid-cols-3`}>
        <div className={`col-span-2`}>
          <ProjectInfo
            project={project}
            isFavoriteButton
            onSwitchView={() => setIsRoleView(!isRoleView)}
            isRoleView={isRoleView}
            submitting={submitting}
            isFavorite={isFavorite}
            onSetFavorite={() => {
              setSubmitting(true);
              addFavoriteProject({
                variables: {
                  fields: {
                    projectID: project?._id,
                    memberID: currentUser?._id,
                    favorite: !isFavorite,
                  },
                },
                context: { serviceName: "soilservice" },
              });
            }}
          />
        </div>
        <div>
          {matchedProject && (
            <div className={`mb-8 flex flex-col items-center px-4 last:pr-0`}>
              <span>⚡ Match</span>
              <span className={`text-soilPurple text-3xl font-semibold`}>
                {round(Number(matchedProject?.matchPercentage), 1) || 0}%
              </span>
            </div>
          )}
          <ProjectChampion member={project?.champion as Members} />
        </div>
      </div>
      {isRoleView && (
        <div className={`my-4 flex`}>
          <TextHeading1>Matching Open Roles</TextHeading1>
          <span className={`my-auto pl-4`}>
            <NumberCircle value={matchedProject?.projectRoles?.length || 0} />
          </span>
        </div>
      )}

      {isRoleView ? (
        <div className={`scrollbar-hide flex flex-grow overflow-y-scroll`}>
          <div
            className={`grid grow grid-cols-1 gap-8 sm:grid-cols-2 xl:grid-cols-3`}
          >
            {matchedProject?.projectRoles?.map((role, index) => (
              <RoleCard
                key={index}
                role={role?.projectRole}
                percentage={role?.matchPercentage || 0}
                onApply={() => setShowModal(true)}
              />
            ))}
            {zeroMatchedProjects?.map((role, index) => (
              <RoleCard
                key={index}
                role={role}
                percentage={0}
                onApply={() => setShowModal(true)}
              />
            ))}
          </div>
        </div>
      ) : (
        <div>
          <div className={`my-6`}>
            <TextHeading1>Project Activity</TextHeading1>
          </div>
        </div>
      )}
      <Modal
        open={showModal}
        onClose={() => {
          setShowModal(false);
        }}
      >
        {!applied ? (
          <div className={``}>
            <TextHeading2>
              Let’s finish up your profile before you apply to the project!
            </TextHeading2>
            <div>
              <TextHeading3>Short Bio</TextHeading3>
              <TextArea
                rows={3}
                value={profileBio}
                onChange={(e) => setProfileBio(e.target.value)}
              />
            </div>
            <div className={`mt-4 text-center`}>
              <TextHeading3>What’s your availability?</TextHeading3>
            </div>
            <div className={`mx-auto w-40`}>
              <Dropdown
                value={timezone}
                items={timezones}
                placeholder={`Timezone`}
                onSelect={(val) => setTimezone(val.name)}
              />
            </div>

            <div className={`flex justify-center space-x-4`}>
              <div className={`w-24`}>
                <TextField
                  placeholder={`Hours`}
                  radius="pill"
                  type={`number`}
                  value={hoursPerWeek.toString()}
                  onChange={(e) => setHoursPerWeek(Number(e.target.value))}
                />
              </div>
              <div className={`my-auto font-medium text-zinc-600`}>
                hrs. / week
              </div>
            </div>
            <div className={`mt-4 text-center`}>
              <TextHeading3>DROP YOUR SOCIALS</TextHeading3>
            </div>
            <p className={`my-4 text-center text-xs`}>
              adding links is not required, but it significantly boosts your
              discoverability.
            </p>
            <div className={`my-6 flex w-full`}>
              <FaTwitter
                size="2rem"
                color="#000000"
                className={`my-auto mr-4`}
              />
              <TextField
                radius="pill"
                placeholder={`Twitter Handle`}
                value={twitterHandle}
                onChange={(e) => setTwitterHandle(e.target.value)}
              />
            </div>
            <div className={`my-6 flex w-full`}>
              <FaGithub
                size="2rem"
                color="#000000"
                className={`my-auto mr-4`}
              />
              <TextField
                radius="pill"
                placeholder={`Github Handle`}
                value={githubHandle}
                onChange={(e) => setGithubHandle(e.target.value)}
              />
            </div>
            <div className={`my-6 flex w-full`}>
              <FaTelegram
                size="2rem"
                color="#000000"
                className={`my-auto mr-4`}
              />
              <TextField
                radius="pill"
                placeholder={`Telegram Handle`}
                value={telegramHandle}
                onChange={(e) => setTelegramHandle(e.target.value)}
              />
            </div>
            <div className={`flex justify-center`}>
              <Button onClick={() => handleApply()} disabled={submitting}>
                Submit Application
              </Button>
            </div>
          </div>
        ) : (
          <div className={`h-7/10 relative -mt-8 w-full`}>
            <ConfettiContainer>
              <div className={`m-auto justify-center`}>
                <div
                  className={`text-darkGreen my-auto pt-32 text-center text-4xl font-bold`}
                >
                  YOU DID IT!
                </div>
                <div className={`absolute bottom-8 flex w-full justify-center`}>
                  <Button
                    onClick={() => {
                      router.push(`/projects`);
                    }}
                    disabled={submitting}
                  >
                    Explore Projects
                  </Button>
                </div>
              </div>
            </ConfettiContainer>
          </div>
        )}
      </Modal>
    </Card>
  );
};
