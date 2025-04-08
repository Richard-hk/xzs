package com.mindskip.xzs.viewmodel.admin.paper;

import com.mindskip.xzs.base.BasePage;

public class ExamPaperAnswerPageRequestVM extends BasePage {
    private Integer subjectId;

    private Integer examPaperId;

    private String userName;

    private String type;

    public Integer getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Integer subjectId) {
        this.subjectId = subjectId;
    }

    public String getUserName() {
        return userName;
    }

    public String getType(){return type;}

    public void setType(String type){this.type = type;}

    public Integer getExamPaperId(){return examPaperId;}

    public void setExamPaperId(Integer examPaperId){this.examPaperId = examPaperId;}

    public void setUserName(String userName) {
        this.userName = userName;
    }
}
