import React from "react";
import { SyntheticEvent } from "react";

export const AsyncCascadingDropDowns = ({
    swt,
    setSwt,
    watch,
    setWatch
}: any) => {
    const sheetChanged = (e: SyntheticEvent) => {
        const sname = swt[e.nativeEvent.target.selectedIndex].name;
        const sheet = swt.find((s) => s.name === sname);
        const sortedArr = swt
            .reduce((acc, element) => {
                if (sheet.name != element.name) {
                    return [element, ...acc];
                }
                return [...acc, element];
            }, [])
            .reverse();
        setSwt(sortedArr);
    };

    const addSheetWatch = async () => {
        let newWatch = {
            cols: swt[0].tabs[0].properties.gridProperties.columnCount,
            sheet: swt[0].name,
            tab: swt[0].tabs[0].properties.title,
            id: swt[0].tabs[0].properties.sheetId
        };

        let dup = watch.find(
            (w) => w.sheet === newWatch.sheet && w.tab == newWatch.tab
        );

        if (!dup) {
            setWatch((w) => [...w, newWatch]);
        } else {
            alert("duplicate");
        }
    };

    const tabChanged = (e: SyntheticEvent) => {
        const tabIndex = e.nativeEvent.target.selectedIndex;
        const title = swt[0].tabs[tabIndex].properties.title;

        const sortedArr = swt[0].tabs
            .reduce((acc, element) => {
                if (title != element.properties.title) {
                    return [element, ...acc];
                }
                return [...acc, element];
            }, [])
            .reverse();

        let newSwt = swt;
        newSwt[0].tabs = sortedArr;
        setSwt(newSwt);
    };

    return (
        <>
            {swt.length ? (
                <div className="add-sheet-toolbar">
                    <div className="cascading-dropdowns">
                        <>
                            {"Select Sheet:"}
                            <select onChange={sheetChanged}>
                                {swt.map((s) => (
                                    <option key={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </>
                        <hr />
                        <>
                            {"Select Tab: "}
                            <select onChange={tabChanged}>
                                {swt.map((s, i) => {
                                    if (s && i === 0) {
                                        if (s.tabs) {
                                            return s.tabs.map((t) => {
                                                return (
                                                    <option
                                                        value={
                                                            t?.properties
                                                                .sheetId
                                                        }
                                                        key={
                                                            t?.properties
                                                                .sheetId
                                                        }
                                                    >
                                                        {t.properties.title}
                                                    </option>
                                                );
                                            });
                                        }
                                    }
                                })}
                            </select>
                        </>
                    </div>

                    <hr />
                    <button onClick={addSheetWatch}>Add Sheet</button>
                </div>
            ) : null}
        </>
    );
};
