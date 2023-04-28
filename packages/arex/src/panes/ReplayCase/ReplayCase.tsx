import { useRequest } from 'ahooks';
import { ArexPaneFC, CollapseTable, DiffPath, PanesTitle, useTranslation } from 'arex-core';
import React, { useRef, useState } from 'react';

import { ComparisonService, ReportService } from '../../services';
import {
  PlanItemStatistics,
  QueryAllDiffMsgReq,
  ReplayCaseType,
} from '../../services/ReportService';
import Case from './Case';
// import { SaveCaseRef } from './SaveCase';

const ReplayCasePage: ArexPaneFC<PlanItemStatistics & { filter: number }> = (props) => {
  const { t } = useTranslation(['components']);
  const [selectedRecord, setSelectedRecord] = useState<ReplayCaseType>();

  const saveCaseRef = useRef<any>(null);

  const {
    data: diffMsgAll = {
      compareResultDetailList: [],
      totalCount: 0,
    },
    mutate: setDiffMsgAll,
    loading: loadingDiffMsgAll,
    run: queryAllDiffMsg,
  } = useRequest(
    (params: Pick<QueryAllDiffMsgReq, 'recordId' | 'planItemId'>) =>
      ReportService.queryAllDiffMsg({
        ...params,
        diffResultCodeList: [0, 1, 2],
        pageIndex: 0,
        pageSize: 2000, // TODO lazy load
        needTotal: true,
      }),
    {
      manual: true,
      onBefore() {
        setDiffMsgAll();
      },
    },
  );

  const handleClickRecord = (record: ReplayCaseType) => {
    setSelectedRecord(selectedRecord?.recordId === record.recordId ? undefined : record);
    queryAllDiffMsg({
      recordId: record.recordId,
      planItemId: props.data.planItemId,
    });
  };

  function handleClickSaveCase(record: ReplayCaseType) {
    saveCaseRef.current?.openModal(record);
  }

  return (
    <>
      <PanesTitle
        title={
          <span>
            {t('replay.caseServiceAPI')}: {props.data.operationName}
          </span>
        }
      />

      <CollapseTable
        active={!!selectedRecord}
        table={
          <Case
            planItemId={props.data.planItemId}
            onClick={handleClickRecord}
            onClickSaveCase={handleClickSaveCase}
            filter={props.data.filter}
          />
        }
        panel={
          <DiffPath
            appId={props.data.appId}
            operationId={props.data.operationId}
            loading={loadingDiffMsgAll}
            data={diffMsgAll.compareResultDetailList}
            onQueryLogEntity={ReportService.queryLogEntity}
            onIgnoreNode={(path) =>
              ComparisonService.insertIgnoreNode({
                operationId: props.data.operationId,
                appId: props.data.appId,
                exclusions: path,
              })
            }
          />
        }
      />
      {/*<SaveCase operationId={props.data.operationId} ref={saveCaseRef} />*/}
    </>
  );
};

export default ReplayCasePage;
