'''
Created on 2016年12月16日

@author: gzq
'''
import os
import time
import getopt
import sys


if __name__ == '__main__':
    commit = 1
    force = False
    # 获取输入参数 -c commit
    opts, args = getopt.getopt(sys.argv[1:], "hpf", ['help', 'pull', 'force'])
    for op, value in opts:
        if op in ("-p", "--pull"):
            commit = 0
        elif op in ("-f", "--force"):
            commit = 0
            force = True
        elif op in ("-h", "--help"):
            print('-h     : print this help message and exit (also --help)')
            print('-p     : git pull  (also --pull)')
            print('-f     : git pull force  (also --force)')
            sys.exit()
    if commit:
        os.system('git add *')
        os.system('git commit -m \'%s\'' % time.strftime('%Y-%m-%d_%X',
                                                         time.localtime()))
        os.system('git push origin master')
        print('提交完成')
    else:
        if force:
            os.system('git fetch --all')
            os.system('git reset --hard origin/master')
            os.system('git pull')
        else:
            os.system('git fetch origin master')
            os.system('git merge origin/master')
        print('更新完成')
