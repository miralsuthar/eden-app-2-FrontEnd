import { useQuery } from "@apollo/client";
// import { UserContext } from "@eden/package-context";
import { FIND_PROJECT } from "@eden/package-graphql";
// import { useContext } from "react";
import { AppUserMenuLayout, MyProjectContainer } from "@eden/package-ui";
import { useRouter } from "next/router";

import type { NextPageWithLayout } from "../../_app";

const MyProjectsViewPage: NextPageWithLayout = () => {
  const router = useRouter();
  const { _id } = router.query;
  // const { currentUser } = useContext(UserContext);

  // console.log("currentUser", currentUser);

  const { data: dataProject } = useQuery(FIND_PROJECT, {
    variables: {
      fields: {
        _id,
      },
    },
    skip: !_id,
    context: { serviceName: "soilservice" },
  });

  // project data with shortlist
  if (dataProject) console.log("dataProject", dataProject.findProject);

  return <MyProjectContainer />;
};

MyProjectsViewPage.getLayout = (page) => (
  <AppUserMenuLayout recommnededSidebar={false}>{page}</AppUserMenuLayout>
);

export default MyProjectsViewPage;

import { IncomingMessage, ServerResponse } from "http";
import { getSession } from "next-auth/react";

export async function getServerSideProps(ctx: {
  req: IncomingMessage;
  res: ServerResponse;
}) {
  const session = await getSession(ctx);

  const url = ctx.req.url?.replace("/", "");

  if (!session) {
    return {
      redirect: {
        destination: `/login?redirect=${url}`,
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
}
