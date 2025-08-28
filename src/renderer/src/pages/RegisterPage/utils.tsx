import { IoCodeSlash } from "react-icons/io5";
import { CiGlobe } from "react-icons/ci";
import { FaGithub } from "react-icons/fa";

import { Props as SuperCardProps } from "@/components/SuperCard";

import { Repository } from "@/store/protfolio/types";

const basename = import.meta.env.VITE_BASENAME;

export function mapRepositoryToProps(repo: Repository): SuperCardProps {
    return {
        title: repo.name,
        topics: repo.topics,
        description: repo.description,
        thumbnail: `${basename}/thumbnails/${repo.name}.png`,
        thumbnailFallback: IoCodeSlash,
        links: [
            { label: "GitHub", icon: <FaGithub />, onClick: () => window.open(repo.html_url) },
            ...(typeof repo.homepage === 'string' && repo.homepage !== ''
                ? [{ label: "Host", icon: <CiGlobe />, onClick: () => window.open(repo.homepage!), },]
                : []
            ),
        ]
    }
}