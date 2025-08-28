import React, { useMemo } from "react";
import { Badge, Link, Spacer, Text, WrapItem, Wrap, Flex, HStack } from "@/components/UI/Common";
import { CiFolderOff } from "react-icons/ci";
import { GoAlert } from "react-icons/go";

import { getRandomColor } from '@/shared/utils';
import withRouter, { WithRouterProps } from "@/hocs/withRouter"
import { useFooter } from "@/layouts/Transformer"
import GalacticOrbiter from "@/components/GalacticOrbiter";
import SectionCard from "@/components/SectionCard";
import StyledMarkdown from "@/components/StyledMarkdown";
import SuperCard from "@/components/SuperCard";
import SliderCards from "@/components/SliderCards";

import { withContainer, Bind } from "@/hocs/withSlicePortfolio";
import { mapRepositoryToProps } from "./utils";

const basename = import.meta.env.VITE_BASENAME;

const avatarTechs = {
    centerImage: `${basename}/logos/avatar.png`,
    orbits: [
        {
            radius: 150,
            orbitDuration: 6,
            planets: [
                { imgSrc: `${basename}/logos/typescript.svg` },
                { imgSrc: `${basename}/logos/python.svg` },
            ],
        },
        {
            radius: 250,
            orbitDuration: 9,
            planets: [
                { imgSrc: `${basename}/logos/nodejs.svg` },
                { imgSrc: `${basename}/logos/mysql.svg` },
                { imgSrc: `${basename}/logos/docker.svg` },
            ],
        },
        {
            radius: 350,
            orbitDuration: 12,
            planets: [
                { imgSrc: `${basename}/logos/vitejs.svg` },
                { imgSrc: `${basename}/logos/react.svg` },
            ],
        }
    ]
};


const Home: React.FC<Bind & WithRouterProps> = ({ state: { about, hardskill, softskill, selfHosted, projects, contacts, } }) => {
    const colors = useMemo(() => (
        Array.from({ length: Object.keys(projects.occurrences).length }).map(() => getRandomColor())
    ), [projects.occurrences])


    useFooter(useMemo(() => <>
        <Text>&copy; {new Date().getFullYear()} fe-react-portfolio. All rights reserved.</Text>
        <Spacer />
        <HStack id={"contacts"} gap="1rem">
            {Object.entries(contacts.occurrence ?? {}).map(([label, href]) =>
                <Link href={href} key={label}>{label}</Link>
            )}
        </HStack>
    </>, [contacts]))

    return <>

        <HStack width="100%"
            height={{ base: "30vh", sm: "60vh", md: "60vh", lg: '60vh', xl: '80vh', "2xl": '80vh' }}
        >
            <GalacticOrbiter {...avatarTechs} />
        </HStack>

        <SectionCard
            id={"about"}
            status={about.status}
            isEmpty={about.occurrence === undefined}
            empty={{ icon: <CiFolderOff />, title: "No Data Found", description: "no information present", }}
            style={{ alignItems: "flex-start" }}
            header={{ title: 'About' }}
            body={{
                disableStyle: true,
                content: <Text textStyle="md" fontWeight="normal">
                    <StyledMarkdown content={about.occurrence!} />
                </Text>
            }}
        />

        <Flex id="skills" width="100%" direction={"row"} gap={"4rem"} justifyContent={"center"}
            wrap={{ base: "wrap", sm: "wrap", md: "wrap", lg: 'nowrap', xl: 'nowrap', "2xl": 'nowrap' }}
        >
            <SectionCard
                status={hardskill.status}
                isEmpty={hardskill.occurrence === undefined}
                empty={{ icon: <CiFolderOff />, title: "No Data Found", description: "no information present", }}
                style={{ alignItems: "flex-start" }}
                header={{ title: 'Hard Skills' }}
                body={{
                    disableStyle: false,
                    content: <Text textStyle="md" fontWeight="normal">
                        <StyledMarkdown content={hardskill.occurrence!} />
                    </Text>
                }}
            />

            <SectionCard
                status={softskill.status}
                isEmpty={softskill.occurrence === undefined}
                empty={{ icon: <CiFolderOff />, title: "No Data Found", description: "no information present", }}
                style={{ alignItems: "flex-start" }}
                header={{ title: 'Soft Skills' }}
                body={{
                    disableStyle: false,
                    content: <Text textStyle="md" fontWeight="normal">
                        <StyledMarkdown content={softskill.occurrence!} />
                    </Text>
                }}
            />
        </Flex>

        <SectionCard
            id={"projects"}
            status={projects.status}
            isEmpty={
                Object.keys(projects.occurrences).length === 0
            }
            empty={{ icon: <GoAlert />, title: "Work in progress...", description: "No Projects Found" }}
            style={{ alignItems: "flex-start" }}
            header={{ title: 'Projects' }}
            body={{
                disableStyle: true,
                content: <Wrap justifyContent={"center"} padding={'2rem'}>

                    {selfHosted.occurrences.length !== 0
                        && <Flex key={crypto.randomUUID()} direction="column" alignItems="flex-start" gap="1rem">
                            <Badge colorPalette={getRandomColor()} size={"lg"}>Selfhosted</Badge>
                            <SliderCards items={selfHosted.occurrences.map(repo => mapRepositoryToProps(repo))} />
                        </Flex>
                    }

                    {/* Forza un'interruzione di linea dopo ogni categoria */}
                    <WrapItem flexBasis="100%" />

                    {Object.entries(projects.occurrences).map(([category, repos], catIndex) => <React.Fragment key={category}>
                        {repos.map((repo, index) =>
                            <Flex key={crypto.randomUUID()} direction="column" alignItems="flex-start" gap="1rem">

                                <Badge colorPalette={colors[catIndex]} visibility={index === 0 ? "visible" : "hidden"} size={"lg"}>
                                    {category}
                                </Badge>

                                <SuperCard {...mapRepositoryToProps(repo)} />
                            </Flex>
                        )}
                    </React.Fragment>)}
                </Wrap>
            }}
        />
    </>
}

export default withContainer(withRouter(Home));
