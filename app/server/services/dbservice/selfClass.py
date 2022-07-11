import json
import os,fnmatch
from datetime import datetime

from originClass import record, store_json_file


# def store_json_origin(parameter_dic,path):
#     # retval = os.getcwd()
#     # new_retval = retval + "/databaseOrigin"
#     # os.chdir(new_retval)
#     with open(parameter_dic["title"] + ".json", 'w') as f:
#         json.dump(parameter_dic, f)
#     print("S?")



# def get_file(path,file_name):
#     os.chdir(path)
#     names = os.listdir('.')
#     for name in names:
#         if fnmatch.fnmatch(name, file_name):
#             print(name)
#             print("Successful")
#             return
#     return


def create_new_json_file_self(id, title, audio_file_dir, level, typeA, timeP):
    now = datetime.now()
    current_time = now.strftime("%Y-%m-%d %H:%M:%S")
    if timeP != None:
        current_time = timeP
    new_json_class = record(id,title,title+".json",audio_file_dir,level,current_time,typeA)
    new_dic = new_json_class.create_dict_origin()
    # print("11" + os.getcwd())
    store_json_file(new_dic)

    return


def create_new_file_in_self(id, title, audio_file_dir, level, typeA, timeP):
    retval = os.getcwd()
    new_retval = retval + "/databaseSelf"
    os.chdir(new_retval)

    create_new_json_file_self(id, title, audio_file_dir, level, typeA, timeP)
    os.chdir(retval)


def delete_file_according_to_id_self(id):
    retval = os.getcwd()
    new_retval = retval + "/databaseSelf"
    os.chdir(new_retval)
    names = os.listdir('.')
    for name in names:
        with open(name,'r') as f:
            temp_dic = json.load(fp=f)
            if temp_dic["id"] == id:
                temp_name_audio = temp_dic["audio_file_dir"]
                temp_name_json = temp_dic["text_file_dir"]
                os.remove(temp_name_json)
                os.chdir(retval+"/audioSelf")
                os.remove(temp_name_audio)
                #Do we need to close it mannually?
                os.chdir(retval)
                return
    print("Can't find such file")
    os.chdir(retval)
    return


def delete_file_according_to_file_name_self(title):
    retval = os.getcwd()
    # print(retval)
    new_retval = retval + "/databaseSelf"
    os.chdir(new_retval)
    names = os.listdir('.')
    for name in names:
        if name == (title +".json"):
            with open(name, 'r') as f:
                temp_dic = json.load(fp=f)
                temp_name_audio = temp_dic["audio_file_dir"]
                os.remove(name)
                os.chdir(retval + "/audioSelf")
                os.remove(temp_name_audio)
                os.chdir(retval)
                return
    print("Can't find such file (title)")
    os.chdir(retval)
    return


def find_file_according_to_id_self(id):
    retval = os.getcwd()
    new_retval = retval + "/databaseSelf"
    os.chdir(new_retval)
    names = os.listdir('.')
    for name in names:
        with open(name, 'r') as f:
            temp_dic = json.load(fp=f)
            if temp_dic["id"] == id:
                temp_title = temp_dic["title"]
                temp_file_name_json = temp_dic["text_file_dir"]
                temp_audio_file = temp_dic["audio_file_dir"]
                temp_level = temp_dic["level"]
                temp_upgrade_time = temp_dic["upgrade_time"]
                temp_type = temp_dic["typeA"]

                new_record = record(temp_dic["id"],temp_title,temp_file_name_json,temp_audio_file,temp_level,temp_upgrade_time,temp_type)

                # Do we need to close it mannually?
                os.chdir(retval)
                return new_record

    print("Can't find such file")
    os.chdir(retval)
    return None


def find_file_according_to_title_self(file_name_title):
    retval = os.getcwd()
    new_retval = retval + "/databaseSelf"
    os.chdir(new_retval)
    names = os.listdir('.')
    for name in names:
        # print(name)
        if name == (file_name_title+".json"):
            with open(name, 'r') as f:
                temp_dic = json.load(fp=f)
                temp_id = temp_dic["id"]
                temp_title = temp_dic["title"]
                temp_file_name_json = temp_dic["text_file_dir"]
                temp_audio_file = temp_dic["audio_file_dir"]
                temp_level = temp_dic["level"]
                temp_upgrade_time = temp_dic["upgrade_time"]
                temp_type = temp_dic["typeA"]

                new_record = record(temp_id, temp_title, temp_file_name_json, temp_audio_file, temp_level,
                                    temp_upgrade_time, temp_type)
                # print(new_record)
                os.chdir(retval)
                return new_record
    os.chdir(retval)
    print("Can't find such file")
    return None

def change_file_title_time_self(title, new_title, timeP):
    # when you use the function, if only title or time is used, set the other to None

    new_file = find_file_according_to_title_self(title)
    # print(os.getcwd())
    temp_dic = new_file.create_dict_origin()
    retval = os.getcwd()
    new_retval = retval + "/databaseSelf"
    os.chdir(new_retval)
    names = os.listdir('.')
    for name in names:
        if name == (title+".json"):
            os.remove(name)

    if timeP ==None:
        used_time = temp_dic["upgrade_time"]
    else:
        used_time = timeP

    if new_title == None:
        used_title = title
    else:
        used_title = new_title

    create_new_json_file_self(temp_dic["id"], used_title, temp_dic["audio_file_dir"], temp_dic["level"], temp_dic["typeA"], used_time)
    os.chdir(retval)
    return


def change_file_title_time_self_id(id, new_title, timeP):
    # when you use the function, if only one of title or time is used, set the other to None

    new_file = find_file_according_to_id_self(id)
    # print(os.getcwd())
    temp_dic = new_file.create_dict_origin()
    retval = os.getcwd()
    new_retval = retval + "/databaseSelf"
    os.chdir(new_retval)
    names = os.listdir('.')
    flag = False
    for name in names:
        with open(name, 'r') as f:
            temp_dic = json.load(fp=f)
            if temp_dic["id"] == id:
                os.remove(temp_dic["text_file_dir"])
                flag =True
                break

    if flag is False:
        print("can't find such file")
        return


    if timeP ==None:
        used_time = temp_dic["upgrade_time"]
    else:
        used_time = timeP

    if new_title == None:
        used_title = temp_dic["title"]
    else:
        used_title = new_title

    create_new_json_file_self(temp_dic["id"], used_title, temp_dic["audio_file_dir"], temp_dic["level"], temp_dic["typeA"], used_time)
    os.chdir(retval)
    return