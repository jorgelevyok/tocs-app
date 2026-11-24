"use client";

import { AppHeader } from "@/components/AppHeader";
import { NewTocIllustration } from "@/components/Illustration";
import { Screen } from "@/components/Screen";
import { TocForm } from "@/components/TocForm";
import { goBack } from "@/lib/navigation";
import { useTocs } from "@/state/tocs";

export default function NewTocScreen() {
  const { addToc } = useTocs();

  return (
    <Screen edges={["top", "left", "right", "bottom"]} testID="new-toc-screen">
      <AppHeader mode="back" title="Nuevo TOC" accessory={<NewTocIllustration />} />
      <TocForm
        subtitle="Sin registros"
        submitLabel="Crear TOC"
        onSubmit={async (draft) => {
          await addToc(draft);
          goBack();
        }}
      />
    </Screen>
  );
}
