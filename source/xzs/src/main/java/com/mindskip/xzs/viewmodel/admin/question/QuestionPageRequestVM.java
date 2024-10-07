package com.mindskip.xzs.viewmodel.admin.question;

import com.mindskip.xzs.base.BasePage;

import java.lang.reflect.Array;
import java.util.List;


public class QuestionPageRequestVM extends BasePage {

    private Integer id;
    private Integer level;
    private Integer subjectId;
    private Integer questionType;
    private List<Integer> filterIds;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getLevel() {
        return level;
    }

    public void setLevel(Integer level) {
        this.level = level;
    }

    public Integer getSubjectId() {
        return subjectId;
    }

    public void setSubjectId(Integer subjectId) {
        this.subjectId = subjectId;
    }

    public Integer getQuestionType() {
        return questionType;
    }

    public void setQuestionType(Integer questionType) {
        this.questionType = questionType;
    }

    public List<Integer> getFilterIds(){return filterIds;}

    public void setFilterIds(List<Integer> filterIds){this.filterIds=filterIds;}
}
