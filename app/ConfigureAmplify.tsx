"use client";

import { Amplify } from "aws-amplify";
import { useEffect } from "react";
import config from "@/amplify_outputs.json";

export const ConfigureAmplify = () => {
    useEffect(() => {
        Amplify.configure(config);
    }, []);

    return null;
};
